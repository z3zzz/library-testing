import is from "@sindresorhus/is";
import { Router } from "express";
import { login_required } from "../middlewares/login_required";
import { CertificateService } from "../services/certificateService";

const certificateRouter = Router();
certificateRouter.use(login_required);

certificateRouter.post("/certificate/create", async function (req, res, next) {
  try {
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    // req (request) 에서 데이터 가져오기
    const user_id = req.body.user_id;
    const title = req.body.title;
    const description = req.body.description;
    const when_date = req.body.when_date;

    // 위 데이터를 유저 db에 추가하기
    const newCertificate = await CertificateService.addCertificate({
      user_id,
      title,
      description,
      when_date,
    });

    res.status(201).json(newCertificate);
  } catch (error) {
    next(error);
  }
});

certificateRouter.get("/certificates/:id", async function (req, res, next) {
  try {
    // req (request) 에서 id 가져오기
    const certificateId = req.params.id;

    // 위 id를 이용하여 db에서 데이터 찾기
    const certificate = await CertificateService.getCertificate({
      certificateId,
    });

    if (certificate.errorMessage) {
      throw new Error(certificate.errorMessage);
    }

    res.status(200).send(certificate);
  } catch (error) {
    next(error);
  }
});

certificateRouter.put("/certificates/:id", async function (req, res, next) {
  try {
    // URI로부터 수상 데이터 id를 추출함.
    const certificateId = req.params.id;

    // body data 로부터 업데이트할 수상 정보를 추출함.
    const title = req.body.title ?? null;
    const description = req.body.description ?? null;
    const when_date = req.body.when_date ?? null;

    const toUpdate = { title, description, when_date };

    // 위 추출된 정보를 이용하여 db의 데이터 수정하기
    const certificate = await CertificateService.setCertificate(
      { certificateId },
      toUpdate
    );

    if (certificate.errorMessage) {
      throw new Error(certificate.errorMessage);
    }

    res.status(200).send(certificate);
  } catch (error) {
    next(error);
  }
});

certificateRouter.delete("/certificates/:id", async function (req, res, next) {
  try {
    // req (request) 에서 id 가져오기
    const certificateId = req.params.id;

    // 위 id를 이용하여 db에서 데이터 삭제하기
    const result = await CertificateService.deleteCertificate({
      certificateId,
    });

    if (result.errorMessage) {
      throw new Error(result.errorMessage);
    }

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

certificateRouter.get(
  "/certificatelist/:user_id",
  async function (req, res, next) {
    try {
      // 특정 사용자의 전체 자격증 목록을 얻음
      // @ts-ignore
      const user_id = req.params.user_id;
      const certificateList = await CertificateService.getCertificateList({
        user_id,
      });
      res.status(200).send(certificateList);
    } catch (error) {
      next(error);
    }
  }
);

export { certificateRouter };
