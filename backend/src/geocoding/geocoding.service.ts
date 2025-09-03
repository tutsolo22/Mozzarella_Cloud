import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { firstValueFrom, catchError } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';

// Interfaces para tipar la respuesta de la API de OpenCage
interface OpenCageGeocodingResult {
  geometry: {
    lat: number;
    lng: number;
  };
}
interface OpenCageResponse {
  results: OpenCageGeocodingResult[];
  status: { code: number; message: string };
}

interface GeocodingResult {
  lat: number;
  lng: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private defaultApiKey: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {
    this.defaultApiKey = this.configService.get<string>('OPENCAGE_API_KEY');
  }

  async geocode(address: string, tenantId: string): Promise<GeocodingResult | null> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['configuration'],
    });

    // Usamos la clave del tenant si existe, si no, la clave por defecto.
    const apiKey = tenant?.configuration?.openCageApiKey ?? this.defaultApiKey;

    if (!apiKey) {
      this.logger.warn(`No se proporcionó API Key para geocodificación (Tenant: ${tenantId}). Saltando geocodificación.`);
      return null;
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&language=es&countrycode=ar`;

    try {
      // Añadimos el tipo explícito a la respuesta de la petición HTTP
      const response = await firstValueFrom(
        this.httpService.get<OpenCageResponse>(url).pipe(
          catchError(error => {
            // Esto nos da un log más detallado si la petición HTTP falla
            if (axios.isAxiosError(error)) {
              this.logger.error(
                `Error de Axios en geocodificación: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`,
              );
            }
            throw error; // Re-lanzamos el error para que sea capturado por el bloque catch principal
          }),
        ),
      );

      if (response.data?.status?.code === 200 && response.data.results.length > 0) {
        return response.data.results[0].geometry; // Devuelve { lat, lng }
      }
      return null;
    } catch (error) {
      this.logger.error(`Fallo en la geocodificación para la dirección: "${address}"`, error.stack);
      return null;
    }
  }
}