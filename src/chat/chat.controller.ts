import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/types';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('ask')
  @ApiOperation({
    summary: 'Ask a question using uploaded documents and chat memory',
  })
  ask(@CurrentUser() user: AuthUser, @Body() dto: AskQuestionDto) {
    return this.chat.ask(user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get saved chat memory for the logged-in user' })
  history(@CurrentUser() user: AuthUser) {
    return this.chat.history(user.id);
  }
}
