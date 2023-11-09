import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt/dist';
import { UserDto } from './user.dto';

const users = [
  { username: 'liudezhang', password: '1823799296', email: 'xxx@xxx.com' },
  { username: 'guang', password: '111111', email: 'xxx@xxx.com' },
  { username: 'dong', password: '222222', email: 'yyy@yyy.com' },
];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(JwtService)
  private JwtService: JwtService;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('login')
  login(@Body() userDto: UserDto) {
    const user = users.find((item) => item.username === userDto.username);

    console.log(UserDto);

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== userDto.password) {
      throw new BadRequestException('密码错误');
    }

    const accessToken = this.JwtService.sign(
      {
        username: user.username,
        email: user.email,
      },
      {
        expiresIn: '0.001h',
      },
    );

    const refreshToken = this.JwtService.sign(
      {
        username: user.username,
        email: user.email,
      },
      {
        expiresIn: '1d', // 1天过期
      },
    );
    console.log(userDto);

    return {
      code: 200,
      data: {
        userInfo: {
          username: user.username,
          email: user.email,
        },
        accessToken,
        refreshToken,
      },
      message: '操作成功',
    };
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    try {
      const authorization = req.headers['authorization'];

      if (!authorization) {
        throw new BadRequestException('用户未登录');
      }

      const token = authorization.split(' ')[1];

      const data = this.JwtService.verify(token);

      console.log(data);

      const user = users.find((item) => item.username === data.username);

      const accessToken = this.JwtService.sign(
        {
          username: user.username,
          email: user.email,
        },
        {
          expiresIn: '0.001h',
        },
      );

      const refreshToken = this.JwtService.sign(
        {
          username: user.username,
          email: user.email,
        },
        {
          expiresIn: '1d', // 1天过期
        },
      );

      return {
        code: 200,
        data: {
          accessToken,
          refreshToken,
        },
        message: '操作成功',
      };
    } catch (error) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }

  @Get('listPage')
  listPage(@Req() req: Request) {
    const authorization = req.headers['authorization'];

    if (!authorization) {
      throw new BadRequestException('用户未登录');
    }

    try {
      const token = authorization.split(' ')[1];
      const data = this.JwtService.verify(token);

      console.log(new Date().getTime());

      return {
        code: 200,
        data: {
          list: [
            {
              id: 1,
              name: 'liudezhang',
              age: 18,
              address: '北京',
            },
            {
              id: 2,
              name: 'guang',
              age: 18,
              address: '北京',
            },
          ],
        },
      };
    } catch (err) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
