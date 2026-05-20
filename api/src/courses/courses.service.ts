import { Injectable } from "@nestjs/common";
import { CourseFilterDto } from "../common/dto/course-filter.dto";
import { CreateCourseDto, UpdateCourseDto } from "../common/dto/course.dto";

@Injectable()
export class CoursesService {
  create(dto: CreateCourseDto) {
    return { action: "createCourse", payload: dto };
  }

  list(query: CourseFilterDto) {
    return { action: "listCourses", query };
  }

  get(id: string) {
    return { action: "getCourse", id };
  }

  update(id: string, dto: UpdateCourseDto) {
    return { action: "updateCourse", id, payload: dto };
  }

  remove(id: string) {
    return { action: "removeCourse", id };
  }
}
