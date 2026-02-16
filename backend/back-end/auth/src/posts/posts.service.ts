import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService
{
	private posts = [];

	create(createPostDto: CreatePostDto)
	{
		const newPost = 
		{
			id: this.posts.length + 1,
			title: createPostDto.title,
			content: createPostDto.content,
		};

		this.posts.push(newPost);
		return newPost;
	}
	getAllposts()
	{
		return this.posts;
	}
}


