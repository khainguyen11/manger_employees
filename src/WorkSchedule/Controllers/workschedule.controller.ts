import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkScheduleService } from '../Services/worlschedule.service';

import { AuthGuard } from 'src/guards/auth.guard';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiHeaders,
} from '@nestjs/swagger';
import { WorkDayDto } from '../dtos/workday.dto';
import { WorkDaySearchDtp } from '../dtos/work_day_search.dto';
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('work-schedules')
export class WorkScheduleController {
  constructor(private workScheduleService: WorkScheduleService) {}
  //get all schedule of employee in one day
  @ApiBody({
    description: 'find schedule',
    type: WorkDaySearchDtp, // Dùng DTO ở đây
  })
  @Post('schedule_employee')
  get_schedule_of_all_employee(@Body() search_schedule: WorkDaySearchDtp) {
    return this.workScheduleService.Get_the_schedule_of_all_employee(
      search_schedule,
    );
  }
  //create schedule
  @ApiBody({
    description: 'register schedule',
    type: [WorkDayDto], // Dùng DTO ở đây
  })
  @Post(':id')
  register(
    @Param('id') employee_id: String,
    @Body() register_schedule: [WorkDayDto],
  ) {
    console.log('vao controller');

    return this.workScheduleService.createScheduleForIntern(
      employee_id,
      register_schedule,
    );
  }
  //update schedule
  @ApiBody({
    description: 'update schedule',
    type: [WorkDayDto], // Dùng DTO ở đây
  })
  @Put('update/:id')
  update_schedule(
    @Param('id') employee_id: String,
    @Body() register_schedule: [WorkDayDto],
  ) {
    console.log('vao controller');

    return this.workScheduleService.updateScheduleForIntern(
      Number(employee_id),
      register_schedule,
    );
  }
  //get current week schedule
  @Get(':id')
  get_week_schedule(@Param('id') employee_id: String) {
    return this.workScheduleService.Get_the_week_schedule(employee_id);
  }
  //get schedule
  @Post('schedule/:id')
  @ApiBody({
    description: 'search schedule detail of employee',
    type: WorkDaySearchDtp, // Dùng DTO ở đây
  })
  search_schedule(
    @Param('id') employee_id: String,
    @Body() search_schedule: WorkDaySearchDtp,
  ) {
    return this.workScheduleService.Get_the_schedule(
      employee_id,
      search_schedule,
    );
  }
  //remove schedule
  @ApiBody({
    description: 'delete schedule',
    type: WorkDaySearchDtp, // Dùng DTO ở đây
  })
  @Post('delete/:id')
  delete_schedule(
    @Param('id') employee_id: String,
    @Body() delete_schedule: WorkDaySearchDtp,
  ) {
    console.log(delete_schedule);

    return this.workScheduleService.deleteScheduleForIntern(
      Number(employee_id),
      delete_schedule,
    );
  }
}
