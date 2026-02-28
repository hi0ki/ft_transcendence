import { Controller, Post, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
  import { Request } from 'express';
  import { FriendsService } from './friends.service';
  import { AuthGuard } from '../guards/auth.guard';
  
  @Controller('friends')
  @UseGuards(AuthGuard)
  export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}
  
    @Post('request/:friendId')
    sendRequest( @Req() req: Request, @Param('friendId') friendId: string) {
      return this.friendsService.sendRequest(
        req.user['id'],
        Number(friendId),
      );
    }
  

    @Post('accept/:friendId')
    acceptRequest(@Req() req: Request, @Param('friendId') friendId: string) {
      return this.friendsService.acceptRequest(
        req.user['id'],
        Number(friendId),
      );
    }

  
    @Post('reject/:friendId')
    rejectRequest( @Req() req: Request, @Param('friendId') friendId: string) {
      return this.friendsService.rejectRequest(
        req.user['id'],
        Number(friendId),
      );
    }
  

    @Delete('remove/:friendId')
    removeFriend(@Req() req: Request, @Param('friendId') friendId: string) {
      return this.friendsService.removeFriend(
        req.user['id'],
        Number(friendId),
      );
    }
  
    
    @Get('list')
    listFriends(@Req() req: Request) {
      return this.friendsService.listFriends(req.user['id']);
    }
  
    @Get('pending')
    listPending(@Req() req: Request) {
      return this.friendsService.listPending(req.user['id']);
    }
  }
  

/*Sending friend requests

Accepting requests

Rejecting / removing

Blocking

Listing friends

Listing pending requests*/