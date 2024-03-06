import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent,
} from 'ng-apexcharts';
import { UniqueEmployee } from '../app.component';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-employee-chart',
  templateUrl: './employee-chart.component.html',
  styleUrl: './employee-chart.component.css',
})
export class EmployeeChartComponent implements OnInit {
  @Input() employees: UniqueEmployee[] = [];
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: ChartOptions = {
    series: [],
    chart: {
      width: 600,
      type: 'pie',
    },
    labels: [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {
    const employeeArr: string[] = [];
    const employeeHoursArr: number[] = [];

    this.employees.forEach((employee) => {
      employeeArr.push(employee.name);
      employeeHoursArr.push(employee.totalHours);
    });

    this.chartOptions.series = [...employeeHoursArr];
    this.chartOptions.labels = [...employeeArr];
  }
}
