import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Employee, PaymentFrequency } from './entities/employee.entity';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  // --- Positions ---
  async createPosition(dto: CreatePositionDto, tenantId: string): Promise<Position> {
    const position = this.positionRepository.create({ ...dto, tenantId });
    return this.positionRepository.save(position);
  }

  findAllPositions(tenantId: string): Promise<Position[]> {
    return this.positionRepository.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async updatePosition(id: string, dto: UpdatePositionDto, tenantId: string): Promise<Position> {
    const position = await this.positionRepository.preload({ id, tenantId, ...dto });
    if (!position) {
      throw new NotFoundException(`Puesto con ID #${id} no encontrado.`);
    }
    return this.positionRepository.save(position);
  }

  async removePosition(id: string, tenantId: string): Promise<void> {
    const positionInUse = await this.employeeRepository.count({ where: { positionId: id, tenantId } });
    if (positionInUse > 0) {
      throw new ConflictException(`No se puede eliminar el puesto porque está asignado a ${positionInUse} empleado(s).`);
    }
    const result = await this.positionRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Puesto con ID #${id} no encontrado.`);
    }
  }

  // --- Employees ---
  async createEmployee(dto: CreateEmployeeDto, tenantId: string): Promise<Employee> {
    const userAlreadyEmployee = await this.employeeRepository.findOneBy({ userId: dto.userId, tenantId });
    if (userAlreadyEmployee) {
      throw new ConflictException('Este usuario ya está registrado como empleado.');
    }
    const employee = this.employeeRepository.create({ ...dto, tenantId });
    return this.employeeRepository.save(employee);
  }

  findAllEmployees(tenantId: string, locationId?: string) {
    const whereClause: FindOptionsWhere<Employee> = { tenantId };
    if (locationId) {
      // Filter employees by the location of their associated user
      whereClause.user = { locationId };
    }
    return this.employeeRepository.find({ where: whereClause, relations: ['user', 'position'] });
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, tenantId: string): Promise<Employee> {
    const employee = await this.employeeRepository.preload({ id, tenantId, ...dto });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID #${id} no encontrado.`);
    }
    return this.employeeRepository.save(employee);
  }

  async removeEmployee(id: string, tenantId: string): Promise<void> {
    const result = await this.employeeRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado con ID #${id} no encontrado.`);
    }
  }

  /**
   * Calculates the total labor cost for a given period.
   * This is a simplified calculation and might need adjustments for real-world scenarios
   * (e.g., considering exact days in month, hire/fire dates within the period).
   */
  async calculateLaborCost(tenantId: string, startDate: Date, endDate: Date, locationId?: string): Promise<number> {
    const whereClause: FindOptionsWhere<Employee> = { tenantId };
    if (locationId) {
      // Filter employees by the location of their associated user
      whereClause.user = { locationId };
    }
    const employees = await this.employeeRepository.find({ where: whereClause, relations: ['position'] });
    if (employees.length === 0) {
      return 0;
    }

    const totalDaysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
    let totalCost = 0;

    for (const employee of employees) {
      const salary = Number(employee.salary);
      let dailyCost = 0;

      switch (employee.paymentFrequency) {
        case PaymentFrequency.Daily:
          dailyCost = salary;
          break;
        case PaymentFrequency.Weekly:
          dailyCost = salary / 7;
          break;
        case PaymentFrequency.BiWeekly:
          dailyCost = salary / 14;
          break;
        case PaymentFrequency.Monthly:
          dailyCost = salary / 30.44; // Average days in a month
          break;
      }
      totalCost += dailyCost * totalDaysInPeriod;
    }

    return totalCost;
  }

  // This method is now specific for the P&L report and ensures a locationId is used.
  async calculateLaborCostForLocation(locationId: string, startDate: Date, endDate: Date): Promise<number> {
    // We need the tenantId to call the main function. We can get it from the first employee.
    const firstEmployee = await this.employeeRepository.findOne({ where: { user: { locationId } } });
    if (!firstEmployee) return 0;

    return this.calculateLaborCost(firstEmployee.tenantId, startDate, endDate, locationId);
  }
}