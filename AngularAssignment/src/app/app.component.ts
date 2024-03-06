import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../environments/environment.development';

type Employee = {
  DeletedOn: null;
  EmployeeName: string;
  EndTimeUtc: string;
  EntryNotes: string;
  Id: string;
  StarTimeUtc: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  apiUrl = `https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=${environment.apiKey}`;
  employeesSubscription: Subscription = new Subscription();
  employees: { name: string; totalHours: number; totalMinutes: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.employeesSubscription = this.http
      .get<Employee[]>(this.apiUrl)
      .subscribe({
        next: (data) => {
          this.getUniqueEmployees(data);
        },
        error: (err) => console.error(err),
      });
  }

  getUniqueEmployees(employees: Employee[]) {
    const uniqueEmployee: {
      name: string;
      totalHours: number;
      totalMinutes: number;
    }[] = [];

    employees.forEach((item) => {
      const name = item.EmployeeName;

      if (name === null) return;

      const employeeExistsIndex = uniqueEmployee.findIndex(
        (employee) => employee.name === name
      );

      if (employeeExistsIndex === -1) {
        const timeData = this.calculateWorkingHours(
          item.StarTimeUtc,
          item.EndTimeUtc
        );

        const obj = {
          name: item.EmployeeName,
          totalHours: timeData.hours,
          totalMinutes: timeData.minutes,
        };

        uniqueEmployee.push(obj);
      } else {
        const timeData = this.calculateWorkingHours(
          item.StarTimeUtc,
          item.EndTimeUtc
        );

        uniqueEmployee[employeeExistsIndex].totalHours += timeData.hours;
        uniqueEmployee[employeeExistsIndex].totalMinutes += timeData.minutes;
      }
    });

    uniqueEmployee.map((employee) => {
      const minutesToHours = Math.floor(employee.totalMinutes / 60);
      employee.totalHours += minutesToHours;
    });

    uniqueEmployee.sort((a, b) => b.totalHours - a.totalHours);

    this.employees = uniqueEmployee;
  }

  calculateWorkingHours(
    startTime: string,
    endTime: string
  ): { hours: number; minutes: number } {
    const startTimestamp = Date.parse(startTime);
    const endTimestamp = Date.parse(endTime);

    const durationTimestamp = endTimestamp - startTimestamp;

    if (durationTimestamp <= 0) return { hours: 0, minutes: 0 };

    const durationDate = new Date(durationTimestamp);

    const minutes = durationDate.getUTCMinutes();

    const hours = durationDate.getUTCHours();

    return { hours, minutes };
  }

  ngOnDestroy(): void {
    this.employeesSubscription.unsubscribe();
  }
}
