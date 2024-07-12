const axios = require("axios").default;
var response = require("../res/res");
var tabel = require("../conn/tabel");
var querystr = "";
var queryvalue = "";

// Instance Axios dengan dukungan cookie
const githuburl = "https://api.github.com"; // Ganti dengan URL Jenkins Anda
const apiToken = "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"; // Ganti dengan API Token yang Anda dapatkan
const username = "knittotextile"; // Username Anda
// const pipelineName = "tespipeline2"; // Nama pipeline yang ingin dibuat

exports.get_repo = async function (req, res) {
  //try {
  for (let index = 1; index < 100; index++) {
    let hasilfetch = await axios({
      method: "get",
      url: `${githuburl}/orgs/${username}/repos`,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "YourAppName", // Ganti dengan nama aplikasi Anda
      },
      params: {
        type: "all", // Mengambil semua repository, termasuk yang private
        page: index,
        per_page: 30,
      },
    });
    hasilfetch.data.forEach((element) => {
      console.log(element.name.substring(0, 3));
      if (element.name.substring(0, 3) != "ksm") {
        querystr = "select name from repository where name=? ";
        queryvalue = [element.name];
        tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          if (onres.rows.length == 0) {
            querystr = 'insert into repository values(null,now(),?,?,0,"","AKTIF") ';
            queryvalue = [element.name, element.html_url];
            tabel.queryDB(querystr, queryvalue).then();
          }
        });
      }
    });
  }

  response.ok({ pesan: "repo has get" }, 200, res);
  // } catch (error) {
  //   console.error("Error creating pipeline:", error.response && error.response.data);
  //   response.ok({ pesan: error.response && error.response.data }, 200, res);
  // }
};

exports.get_branch = async function (req, res) {
  const repo = req.body.repo;

  let hasilfetch = await axios({
    method: "get",
    url: `${githuburl}/repos/knittotextile/${repo}/branches`,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "YourAppName", // Ganti dengan nama aplikasi Anda
    },
  });

  response.ok({ data: hasilfetch.data, pesan: "branch has get" }, 200, res);
};
