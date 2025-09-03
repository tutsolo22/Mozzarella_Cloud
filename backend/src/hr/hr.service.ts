import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Employee, PaymentFrequency } from './entities/employee.entity';
import { Position } from './entities/position.entity';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  // --- Positions ---
  createPosition(dto: any, tenantId: string) { /* ... implementation ... */ }
  findAllPositions(tenantId: string) { /* ... implementation ... */ }
  updatePosition(id: string, dto: any, tenantId: string) { /* ... implementation ... */ }
  removePosition(id: string, tenantId: string) { /* ... implementation ... */ }

  // --- Employees ---
  createEmployee(dto: any, tenantId: string) { /* ... implementation ... */ }
  findAllEmployees(tenantId: string, locationId?: string) {
    const whereClause: FindOptionsWhere<Employee> = { tenantId };
    if (locationId) {
      // Filter employees by the location of their associated user
      whereClause.user = { locationId };
    }
    return this.employeeRepository.find({ where: whereClause, relations: ['user', 'position'] });
  }
  updateEmployee(id: string, dto: any, tenantId: string) { /* ... implementation ... */ }

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