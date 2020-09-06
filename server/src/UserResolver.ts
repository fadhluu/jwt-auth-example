import { sendRefreshToken } from './sendRefreshToken';
import { isAuth } from './isAuthMiddleware';
import { createRefreshToken, createAccessToken } from './auth';
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from './entity/User';
import { Context } from './Context';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hello 🤺';
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  wave() {
    return "hello i'm protected 👋";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  whoami(@Ctx() { payload }: Context) {
    console.log(payload);
    return `youre 👉 ${payload?.userId}`;
  }

  @Query(() => [User])
  Users() {
    return User.find();
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('no user found!');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error('wrong password!');
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }
}
