const axios = require("axios").default;
var response = require("../res/res");
var tabel = require("../conn/tabel");
var querystr = "";
var queryvalue = "";

exports.get_cabang = async function (req, res) {
  const tipe_cabang = req.body.tipe_cabang;

  querystr = "select * from cabang where tipe_cabang=? ";
  queryvalue = [tipe_cabang];
  tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    response.ok({ data: onres.rows, pesan: "cabang has get" }, 200, res);
  });
};

exports.get_data_env = async function (req, res) {
  querystr = "select * from data_env";
  queryvalue = [];
  tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    response.ok({ data: onres.rows, pesan: "data env has get" }, 200, res);
  });
};

exports.create_job = async function (req, res) {
  const nama_job = req.body.nama_job;
  const cabang = req.body.cabang;
  const branch = req.body.branch;
  const app_port = req.body.app_port;
  const jenis_server = req.body.jenis_server;
  const detailcabang = req.body.detailcabang;
  const data_env = req.body.data_env;
  const app_path = req.body.app_path;
  const url_repo = req.body.url_repo;

  querystr = "select * from job where name=? ";
  queryvalue = [nama_job];
  tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    if (onres.rows.length == 0) {
      querystr = "insert into job(id,create_date,name,cabang,branch,app_port,app_path,jenis_server,url_repo) values(null,now(),?,?,?,?,?,?,?)";
      queryvalue = [nama_job, cabang, branch, app_port, app_path, jenis_server, url_repo];
      await tabel.queryDB(querystr, queryvalue).then();

      for (let index = 0; index < data_env.length; index++) {
        const element = data_env[index];
        querystr = "insert into job_env(id,create_date,id_job,id_env) values(null,now(),?,?)";
        queryvalue = [element.id_job, element.id_env];
        await tabel.queryDB(querystr, queryvalue).then();
      }

      for (let index = 0; index < detailcabang.length; index++) {
        const element = data_env[index];
        querystr = "insert into job_cabang(id,create_date,id_job,id_cabang) values(null,now(),?,?)";
        queryvalue = [element.id_job, element.id_env];
        await tabel.queryDB(querystr, queryvalue).then();
      }

      return response.ok({ pesan: "Job created successfully" }, 200, res);
    } else {
      return response.ok({ pesan: "Nama Job sudah terdaftar" }, 200, res);
    }
  });
};

exports.create_group_job = async function (req, res) {
  const nama_job = req.body.nama_job;
  const catatan = req.body.catatan;
  const list_job = req.body.list_job;

  querystr = "select * from group_job where name=? ";
  queryvalue = [nama_job];
  tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    if (onres.rows.length == 0) {
      querystr = "insert into group_job(id,create_date,nama_job,catatan) values(null,now(),?,?)";
      queryvalue = [nama_job, catatan];
      await tabel.queryDB(querystr, queryvalue).then();

      for (let index = 0; index < list_job.length; index++) {
        const element = list_job[index];
        querystr = "insert into list_job_group(id,create_date,id_job,id_group,stage_name) values(null,now(),?,?,?)";
        queryvalue = [element.id_job, element.id_group, element.stage_name];
        await tabel.queryDB(querystr, queryvalue).then();
      }

      return response.ok({ pesan: "Job created successfully" }, 200, res);
    } else {
      return response.ok({ pesan: "Nama Group Job sudah terdaftar" }, 200, res);
    }
  });
};
