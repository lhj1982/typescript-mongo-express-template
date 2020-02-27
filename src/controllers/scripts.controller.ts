import { Request, Response, NextFunction } from 'express';
import AuthApi from '../api/auth';
import ScriptsRepo from '../repositories/scripts.repository';
import { InvalidRequestException, ResourceAlreadyExist, ResourceNotFoundException } from '../exceptions/custom.exceptions';
import { BaseController } from './base.controller';
import ScriptService from '../services/script.service';
import config from '../config';

export class ScriptsController extends BaseController {
  getScripts = async (req: Request, res: Response) => {
    try {
      let offset = parseInt(req.query.offset);
      let limit = parseInt(req.query.limit);
      const { keyword } = req.query;
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }
      let result = await ScriptsRepo.find({ keyword, offset, limit });
      const links = this.generateLinks(result.pagination, req.route.path, '');
      result = Object.assign({}, result, links);

      res.json(result);
    } catch (err) {
      res.send(err);
    }
  };

  getScript = async (req: Request, res: Response, next: NextFunction) => {
    const { scriptId } = req.params;
    try {
      const script = await ScriptService.findById(scriptId);
      res.json({ code: 'SUCCESS', data: script });
    } catch (err) {
      next(err);
    }
  };
}
