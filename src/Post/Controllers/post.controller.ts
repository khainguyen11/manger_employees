import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiHeaders,
  ApiOperation,
} from '@nestjs/swagger';
import { PostService } from '../Services/post.service';
import { AuthGuard } from 'src/guards/auth.guard';
@UseGuards(AuthGuard)
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}
  //api create post
  @Post('uploads')
  @ApiOperation({ summary: 'Tải lên nhiều tệp' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tải lên nhiều tệp cùng với nội dung',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Mô tả hình ảnh',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary', // Định dạng cho tệp hình ảnh
          },
          description: 'Danh sách các hình ảnh tải lên',
        },
      },
    },
  })
  async createPost(@Body() content) {
    console.log('vo day');

    return this.postService.createPost(content);
  }
}
