import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class PostsService {
	private readonly AUTH_SERVICE_URL = 'http://auth_service:3000/posts';

	constructor(private http: HttpService) { }

	async createPost(data: any, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.post(this.AUTH_SERVICE_URL, data, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error creating post',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getAllPosts(authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.get(this.AUTH_SERVICE_URL, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error fetching posts',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async update(id: number, dto: any, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.patch(`${this.AUTH_SERVICE_URL}/${id}`, dto, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error updating post',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async remove(id: number, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.delete(`${this.AUTH_SERVICE_URL}/${id}`, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error deleting post',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getOne(id: number, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.get(`${this.AUTH_SERVICE_URL}/${id}`, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error fetching post',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async adminGetAllPosts(status?: string, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.get(this.AUTH_SERVICE_URL + '/admin/all', {
					headers,
					params: status ? { status } : undefined
				}).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error fetching admin posts',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async updatePostStatus(id: number, status: string, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.patch(`${this.AUTH_SERVICE_URL}/admin/${id}/status`, { status }, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error updating post status',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async adminDeletePost(id: number, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.delete(`${this.AUTH_SERVICE_URL}/admin/${id}`, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error deleting post',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getOneDetail(id: number, authHeader?: string) {
		try {
			const headers = authHeader ? { Authorization: authHeader } : {};
			const response = await firstValueFrom(
				this.http.get(`${this.AUTH_SERVICE_URL}/detail/${id}`, { headers }).pipe(
					catchError((error: AxiosError) => {
						throw new HttpException(
							error.response?.data || 'Error fetching post detail',
							error.response?.status || 500
						);
					})
				)
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}
}
