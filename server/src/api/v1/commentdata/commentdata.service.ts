import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentData } from './commentdata.entity';
import { Repository } from 'typeorm';
import { MbtiService } from '../mbti/mbti.service';
import { UsersService } from '../users/users.service';
import { StandardResponseDto } from 'src/dto/standard-response.dto';

@Injectable()
export class CommentdataService {
  constructor(
    @Inject('COMMENTDATA_REPOSITORY')
    private commentRepository: Repository<CommentData>,
    private mbtiService: MbtiService,
    private usersService: UsersService,
  ) {}
  async createNewData(
    paramUserId: number,
    paramMbti: string,
    bodyData: any,
    public_key: any,
  ): Promise<CommentData> {
    //check_key를 통해 public_key가 유효한지 확인
    const check_key = await this.usersService.findOne({
      where: { _id: paramUserId },
    });
    if (!check_key || check_key?.public_key !== public_key.public_key) {
      throw new NotFoundException('public_key not found');
    }
    const newData: CommentData = new CommentData();
    newData.host_id = paramUserId;
    newData.mbti = paramMbti;
    newData.like = bodyData.like;
    if (bodyData.like === undefined || null) {
      throw new NotFoundException(' like data not found');
    }
    newData.comment = '';
    if (bodyData.comment !== undefined) {
      newData.comment = bodyData.comment;
    }
    return newData;
  }
  async countLikes(options: any): Promise<number> {
    const count = await this.commentRepository.count(options);
    return count;
  }
  async createComment(newData: CommentData): Promise<any> {
    await this.commentRepository.save(newData);
    const count = await this.countLikes({
      where: {
        host_id: newData.host_id,
        mbti: newData.mbti,
        like: newData.like,
      },
    });
    await this.mbtiService.updateLikes(newData.host_id, newData.mbti, count);
    return new StandardResponseDto(
      201,
      'api.common.created',
      'Done Like Update',
    );
  }
  async findComments(
    paramUserId: number,
    paramMbti: string,
    public_key: any,
  ): Promise<any[]> {
    const check_key = await this.usersService.findOne({
      where: { _id: paramUserId },
    });
    if (!check_key || check_key?.public_key !== public_key.public_key) {
      throw new NotFoundException('public_key not found');
    }
    const comments = await this.commentRepository.find({
      where: { host_id: paramUserId, mbti: paramMbti },
    });
    if (comments === null) {
      throw new NotFoundException('comment data not found');
    }
    // 빈 문자열인 comment 속성을 제거하고 반환
    const filteredComments = comments.map((commentObject) => {
      if (commentObject.comment === '') {
        const { comment, ...rest } = commentObject;
        return rest;
      }
      return commentObject;
    });

    return filteredComments;
  }
}
