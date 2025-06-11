export interface WorkingHourDto {
  
  day: number;
  start: string;
  end: string;
}

export interface CreateWorkingHourDto {
  barberId: string;
  days: WorkingHourDto[];
}