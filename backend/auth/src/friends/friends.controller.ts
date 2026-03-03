import {
    Controller,
    Post,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    Delete,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    /** POST /friends/request/:targetUserId — send a friend request */
    @Post('request/:targetUserId')
    @HttpCode(HttpStatus.CREATED)
    sendRequest(
        @Param('targetUserId', ParseIntPipe) targetUserId: number,
        @Req() req: any,
    ) {
        return this.friendsService.sendRequest(req.user.id, targetUserId);
    }

    /** POST /friends/accept/:senderId — accept an incoming request */
    @Post('accept/:senderId')
    @HttpCode(HttpStatus.OK)
    acceptRequest(
        @Param('senderId', ParseIntPipe) senderId: number,
        @Req() req: any,
    ) {
        return this.friendsService.acceptRequest(req.user.id, senderId);
    }

    /** DELETE /friends/reject/:senderId — reject / cancel a request */
    @Delete('reject/:senderId')
    @HttpCode(HttpStatus.OK)
    rejectRequest(
        @Param('senderId', ParseIntPipe) senderId: number,
        @Req() req: any,
    ) {
        return this.friendsService.rejectRequest(req.user.id, senderId);
    }

    /** GET /friends/pending — list incoming pending requests */
    @Get('pending')
    getPendingRequests(@Req() req: any) {
        return this.friendsService.getPendingRequests(req.user.id);
    }

    /** GET /friends — list accepted friends */
    @Get()
    getFriends(@Req() req: any) {
        return this.friendsService.getFriends(req.user.id);
    }

    /** DELETE /friends/:friendId — unfriend */
    @Delete(':friendId')
    @HttpCode(HttpStatus.OK)
    removeFriend(
        @Param('friendId', ParseIntPipe) friendId: number,
        @Req() req: any,
    ) {
        return this.friendsService.removeFriend(req.user.id, friendId);
    }

    /** GET /friends/user/:userId — get public friends of a user */
    @Get('user/:userId')
    getUserFriends(
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        return this.friendsService.getUserFriends(userId);
    }

    /** GET /friends/status/:targetUserId — get friendship status */
    @Get('status/:targetUserId')
    getStatus(
        @Param('targetUserId', ParseIntPipe) targetUserId: number,
        @Req() req: any,
    ) {
        return this.friendsService.getStatus(req.user.id, targetUserId);
    }
}
