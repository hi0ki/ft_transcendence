import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PostsService 
{
	constructor(private http: HttpService) {}

	async createPost(data: any)
	{
		const response = await firstValueFrom(
			this.http.post('http://auth_service:3000/posts', data)
		);
		return response.data;
	}

	async getAllPosts()
	{
		const response = await firstValueFrom(
			this.http.get('http://auth_service:3000/posts')
		);
		return response.data;
	}

	async update(id: number, dto: any)
	{
		const response = await firstValueFrom(this.http.patch(`http://auth_service:3000/posts/${id}`, dto), );
		return response.data;
	}

	async remove(id: string)
	{
		const response = await firstValueFrom(this.http.delete(`http://auth_service:3000/posts/${id}`), );
		return response.data;
	}
}
