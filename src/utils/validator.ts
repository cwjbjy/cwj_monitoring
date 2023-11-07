import { isValidURL, isValidInteger } from './regular';
import type { Options } from '../types/index';

abstract class Validator {
  public nextValidator: Validator | null;
  constructor() {
    this.nextValidator = null;
  }
  abstract setNext(validator: Validator): void;
  abstract validate(data: Options): void;
}

/* 验证url */
class UrlValidator extends Validator {
  constructor() {
    super();
  }
  setNext(validator: Validator) {
    this.nextValidator = validator;
  }

  validate(data: Options) {
    if (!isValidURL(data.url)) {
      console.error('请输入符合规范的url');
      return false;
    } else if (this.nextValidator) {
      return this.nextValidator.validate(data);
    } else {
      return true;
    }
  }
}

/* 验证缓存数量 */
class MaxValidator extends Validator {
  constructor() {
    super();
  }
  setNext(validator: Validator) {
    this.nextValidator = validator;
  }

  validate(data: Options) {
    if (data.max && !isValidInteger(data.max)) {
      console.error('max请输入正整数');
      return false;
    } else if (this.nextValidator) {
      return this.nextValidator.validate(data);
    } else {
      return true;
    }
  }
}

/* 验证上报时间 */
class TimeValidator extends Validator {
  constructor() {
    super();
  }
  setNext(validator: Validator) {
    this.nextValidator = validator;
  }

  validate(data: Options) {
    if (data.time && !isValidInteger(data.time)) {
      console.error('time请输入正整数');
      return false;
    } else if (this.nextValidator) {
      return this.nextValidator.validate(data);
    } else {
      return true;
    }
  }
}

/* 责任链模式 */
const urlValidator = new UrlValidator();
const maxValidator = new MaxValidator();
const timeValidator = new TimeValidator();

/* 指定节点在责任链中的顺序 */
urlValidator.setNext(maxValidator);
maxValidator.setNext(timeValidator);

export default urlValidator;
