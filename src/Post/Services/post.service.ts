import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee, ROLES } from 'src/employees/Entity/employee.entity';
import { Repository } from 'typeorm';
import { PostEntity } from '../Entitys/post.entity';
import { EmployeeService } from 'src/employees/Services/employee.service';
import { MailService } from 'src/Payroll/Services/email.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private mailService: MailService,
  ) {}
  private Observer: Employee[];
  async findByRole(role: ROLES) {
    const Employee = await this.employeeRepository.find({
      where: { role: role },
    });
    this.Observer = [];
    Employee.forEach((Employee) => {
      this.Observer.push(Employee);
    });
  }
  async createPost(content) {
    const Post = new PostEntity();
    const files = [];
    content.files.forEach((item) => {
      files.push(item.filename);
    });
    Post.content = content.content;
    Post.created_at = new Date();
    Post.url_image = files.toString();
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: content.employee },
    });
    Post.employee = employee;
    Post.role = content.role;
    employee.post.push(Post);
    await this.employeeRepository.save(employee);
    await this.postRepository.save(Post);
    await this.findByRole(content.role);
    this.Observer.forEach((e) => {
      this.mailService.sendNotify(
        e.email,
        `Có thông báo mới`,
        `${employee.full_name} đã tạo một thông báo mới vui lòng kiểm tra`,
      );
    });
  }
  async getPostByRole(role) {
    return await this.postRepository.find({ where: { role: role } });
  }
  async getAllPost() {
    return await this.postRepository.find();
  }
  async updatePost(content) {}
  async deletePost() {}
  async findByTargetRole() {}
}
