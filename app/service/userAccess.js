'use strict';

const Service = require('egg').Service;

class UserAccessService extends Service {
  async login(payload) {
    const { ctx, service } = this;
    const user = await service.user.findByAccount(payload.account);
    if (!user) {
      ctx.throw(404, 'user not found');
    }
    const verifyPsw = await ctx.compare(payload.password, user.password);
    if (!verifyPsw) {
      ctx.throw(404, 'user password is error');
    }
    // 生成Token令牌
    return { token: await service.actionToken.apply(user._id) };
  }

  async logout() {
    return null;
  }

  async resetPsw(values) {
    const { ctx, service } = this;
    // ctx.state.user 可以提取到JWT编码的data
    const _id = ctx.state.user.data._id;
    const user = await service.user.find(_id);
    if (!user) {
      ctx.throw(404, '用户没有找到！');
    }

    const verifyPsw = await ctx.compare(values.oldPassword, user.password);
    if (!verifyPsw) {
      ctx.throw(404, '用户密码错误！');
    } else {
      // 重置密码
      values.password = await ctx.genHash(values.password);
      return service.user.findByIdAndUpdate(_id, values);
    }
  }

  async current() {
    const { ctx, service } = this;
    // ctx.state.user 可以提取到JWT编码的data
    const _id = ctx.state.user.data._id;
    const user = await service.user.find(_id);
    if (!user) {
      ctx.throw(404, '用户没有找到！');
    }
    user.password = 'How old are you?';
    return user;
  }

  // 修改个人信息
  async resetSelf(values) {
    const { ctx, service } = this;
    // 获取当前用户
    const _id = ctx.state.user.data._id;
    const user = await service.user.find(_id);
    if (!user) {
      ctx.throw(404, '用户没有找到！');
    }
    return service.user.findByIdAndUpdate(_id, values);
  }

  // 更新头像
  async resetAvatar(values) {
    const { ctx, service } = this;
    await service.upload.create(values);
    // 获取当前用户
    const _id = ctx.state.user.data._id;
    const user = await service.user.find(_id);
    if (!user) {
      ctx.throw(404, '用户没有找到！');
    }
    return service.user.findByIdAndUpdate(_id, { avatar: values.url });
  }

}

module.exports = UserAccessService;
