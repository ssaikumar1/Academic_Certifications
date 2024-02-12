import { academic_ecertificates_backend } from "../../declarations/academic_ecertificates_backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../../declarations/academic_ecertificates_backend";
import { html, render } from "lit-html";
import { Principal } from "@dfinity/principal";


let academic_ecertificates_actor;
let authClient;
let latitude;
let longitude;
let accuracy;
let watch;

const ic_interface = document.getElementsByClassName('ic_interface');

function setConnected() {
  for (var i = 0; i < ic_interface.length; i++) {
    var interfac = ic_interface[i];
    interfac.setAttribute('status', 'connected');
    interfac.innerHTML = `<i class="fa-solid fa-link-slash"></i> Disconnect`;
  }
}

function setDisonnected() {
  for (var i = 0; i < ic_interface.length; i++) {
    var interfac = ic_interface[i];
    interfac.setAttribute('status', 'disconnected');
    interfac.innerHTML = `<i class="fa-solid fa-link"></i> Connect`;
  }
}


async function ic_interface_click(e) {
  console.log(e);
  if (e.target.getAttribute('status') === 'connected') {
    academic_ecertificates_actor = academic_ecertificates_backend;
    authClient.logout();
    redirect("/");
  } else {
    authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      identityProvider: process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app/#authorize"
        : `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`,
      onSuccess: async () => {
        handleAuthenticated(authClient);
      },
    });
  }
};

async function handleAuthenticated(authClient) {
  setConnected();
  const identity = await authClient.getIdentity();
  academic_ecertificates_actor = createActor(canisterId, {
    agentOptions: {
      identity, verifyQuerySignatures: false
    },
  });
  var path = window.location.pathname;
  if (path === '/') {
    var resp = await academic_ecertificates_actor.isAccountExists();
    if (resp.statusCode === BigInt(200)) {
      if (resp.msg === "exist") {
        redirect('/profile.html', { "msg": "Logged in using University Login" });
      } else if (resp.msg === "doesntexist") {
        redirect("/register.html");
      }
    }
  }
}


function redirect(path, params) {
  console.log(window.location.origin);
  console.log(path)
  const myUrlWithParams = new URL(window.location.origin + path);
  myUrlWithParams.searchParams.append('canisterId', process.env.CANISTER_ID_ACADEMIC_ECERTIFICATES_FRONTEND);
  if (params) {
    for (let key in params) {
      myUrlWithParams.searchParams.append(key, encodeURIComponent(params[key]));
    }
  }

  window.location.href = myUrlWithParams.href;
}


function createtoast(msg) {
  var count = parseInt($("#contoast").attr("data-count"));
  var toast = `<div id="liveToast` + count + `" data-bs-autohide='false' data-bs-animation='true' data-bs-delay='2000' class="toast" role="alert" aria-live="assertive" aria-atomic="true"><div style="background-color: #673AB7;color: white;" class="toast-header">  
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' viewBox='0 0 576 272'%3E%3Cpath fill='%23fff' d='M576 136C576 61 513.1 0 436 0c-32.2 0-67.2 16.5-104.3 49-17.5 15.4-32.7 31.8-44.2 45-40-44.6-93.8-94-147.5-94C75.1 0 18.6 44.9 3.8 104.4c0-.1 0-.1.1-.2 0 .1 0 .1-.1.2C1.3 114.6 0 125.1 0 136c0 75 61.9 136 139 136 32.2 0 68.2-16.5 105.3-49 17.5-15.4 32.7-31.8 44.2-45 40.1 44.7 93.9 94 147.6 94 64.9 0 121.4-44.9 136.2-104.4 2.4-10.2 3.7-20.7 3.7-31.6zM298.3 93.9C311.4 79.1 324.4 66 337 55c35.6-31.2 68.9-47 99-47 72.8 0 132 57.4 132 128 0 9.9-1.2 19.8-3.6 29.4-.4 1.1-5.2 14.4-19 27.3-18 16.8-42.3 25.3-72.3 25.3 32.3-14 54.9-45.6 54.9-82 0-49.5-41.3-89.8-92-89.8-19.8 0-44 12.4-72 37-12.6 11-25.3 24-38.8 39.5l-5.3 6.1-27.1-28.9 5.5-6zm-47.8 43.4c-10.7 12.7-26.1 30-43.8 45.5-33 28.9-54.4 35-66.7 35-46.3 0-84-36.7-84-81.8 0-44.8 37.7-81.5 84-81.8 1.7 0 3.7.2 6.2.6 23.9 9.2 45.2 23.7 58 35.5 10.4 9.5 29.1 28.9 46.3 47zm27.2 40.8C264.6 192.9 251.6 206 239 217c-35.1 30.8-69.7 47-100 47-35.1 0-68.1-13.3-92.8-37.6C21.6 202.3 8 170.2 8 136c0-9.9 1.2-19.8 3.6-29.4.4-1.1 5.2-14.4 19-27.3C48.6 62.5 72.9 54 102.9 54 70.6 68 48 99.6 48 136c0 49.5 41.3 89.8 92 89.8 19.8 0 44-12.4 72-37 12.6-11 25.3-24 38.8-39.5l5.3-6.1s26.7 28.5 26.9 28.8l-5.3 6.1zm47.8-43.4c10.7-12.7 26.1-30 43.8-45.5 33-28.9 54.4-35 66.7-35 46.3 0 84 36.7 84 81.8 0 44.8-37.7 81.5-84 81.8-1.7 0-3.7-.2-6.2-.6h.1c-23.9-9.2-45.2-23.8-58.1-35.6-10.4-9.4-29.1-28.8-46.3-46.9zm246.6 33v-.1.1z'/%3E%3C/svg%3E" style="height:20px;width:auto;" class="rounded me-2" alt="...">  <strong class="me-auto" style="color:white;">>></strong>  <small style="color:white;margin-right:8px;">Just Now</small>  <button style="margin:0px!important;background-color:white;" type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div><div id='bo` + count + `' style="    background-color: white;COLOR: #673AB7;BORDER: 1PX SOLID #673AB7;border-top: 0;" class="toast-body">              </div>        </div>`;
  // var mtoast =`<div id="mliveToast` +count +`" data-bs-autohide='false' data-bs-animation='true' data-bs-delay='2000' class="toast" role="alert" aria-live="assertive" aria-atomic="true">          <div style="background-color: #000000;color:#ffffff;" class="toast-header">            <img src="data:image/png;base64,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
  // " style="height:20px;width:auto;" class="rounded me-2" alt="...">            <strong class="me-auto">>></strong>            <small>Just Now</small>            <button style="color:while!important;" type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>          </div>          <div id='mbo` +count +`' class="toast-body">              </div>        </div>`;
  $("#contoast").html($("#contoast").html() + toast);
  // $("#mcontoast").html($("#mcontoast").html() + mtoast);
  var bo = document.getElementById("bo" + count);
  bo.innerHTML = msg;
  // mbo = document.getElementById("mbo" + count);
  // mbo.innerHTML = msg;
  $("#liveToast" + count).addClass("fade show");
  // $("#mliveToast" + count).addClass("fade show");
  count++;
  $("#contoast").attr("data-count", count);
  count--;
  setTimeout(function (e) {
    $("#liveToast" + count).toast("hide");
  }, 8000);
  // setTimeout(function (e) {
  //   $("#mliveToast" + count).toast("hide");
  // }, 8000);
}


function persistCannisterId(cannisterIdd) {
  var anchors = document.querySelectorAll('a');
  anchors.forEach(anchor => {
    var href = anchor?.getAttribute("href");
    if (href !== null && href != "") {
      anchor?.setAttribute("href", href + "?canisterId=" + cannisterIdd);
    }
  });
}

function DateFromTimestamp(timestam) {
  const timestamp = timestam; // Replace this with your bigint timestamp

  // Convert bigint timestamp to milliseconds
  const milliseconds = Number(timestamp);
  var myDate = new Date(milliseconds / 1000000);
  // document.write(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

  return myDate.toLocaleString();

}

function DateToMonthFormat(dateString) {
  // Converts "2023-12-05" format to "DEC 2023" format
  const splitDate = dateString.split("-");
  const formattedDate = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
  return formattedDate;
}

async function registerinit() {
  var resp = await academic_ecertificates_actor.isAccountExists();
  console.log(resp);
  if (resp.statusCode === BigInt(200)) {
    if (resp.msg === "exist") {
      redirect('/profile.html', { "msg": "Logged in using University Login" });
    }
  }

  var submitbtn = document.getElementById("uni-frm-sbmt");

  submitbtn.addEventListener("click", async function (event) {
    var form = document.getElementById("register_form");
    if (!form.checkValidity()) {
      var resetsbtn = document.getElementById("org_sub");
      resetsbtn.click();
    } else {
      if (await authClient.isAuthenticated()) {
        var resp = await academic_ecertificates_actor.registerUniversity($("#uni-name").val(), $("#uni-address").val(), BigInt($("#uni-phone").val()), $("#uni-email").val(), BigInt($("#uni-estdyr").val()));
        console.log(resp);
        if (resp.statusCode == BigInt(200)) {
          redirect("/profile.html", { msg: resp.msg });
        } else if (resp.statusCode == BigInt(400)) {
          createtoast(resp.msg);
          setTimeout(function () {
            redirect("/profile.html")
          }, 4000)
        } else {
          redirect("/");
        }
      } else {
        redirect('/');
      }
    }
  });
}


async function profileinit() {
  var resp = await academic_ecertificates_actor.getUniversity([]);
  console.log(resp);
  if (resp.statusCode === BigInt(200)) {
    var university = resp.university[0];
    var certificates = resp.certs[0];
    console.log(certificates);

    document.getElementById("uname").innerText = university.name;
    document.getElementById("uaddress").innerText = university.address;
    document.getElementById("uphno").innerText = university.phno;
    document.getElementById("uemail").innerText = university.email;
    document.getElementById("uestd_yr").innerText = university.estd_yr;


  }
  else {
    redirect("/register.html", { msg: resp.msg });
  }
}

async function openModal(id) {
  var resp = await academic_ecertificates_actor.getCertificate(id);
  console.log(resp);
}

function render_certificate(baseurl, universityUrl, name, rollno, branch, year, cert_id) {
  return `<div class="outer-border">
<div class="inner-dotted-border">
 <span class="certification">Certificate of Graduation</span>
 <br>
 <span class="certify"><i>This is to certify that</i></span>
 <br>
 <span class="name"><b>`+ name + `</b></span><br/>
 <span class="certify"><i>Bearing <B>`+ rollno + `</B> Regd No. </i></span> <br/>
 <span class="certify"><i>has successfully completed the Graduation in</i></span> <br/>
 <span class="fs-30"><b>`+ branch + `</b> Branch</span> <br/>
 <br><div style="text-align: start !important;"><span class="certify" ><i>Graduation Date : </i></span>
<span class="fs-30"><b>`+ year + `</b></span></div>
<div style="text-align: start !important;"><span class="certify" ><i>Certificate ID : </i></span>
  <a href="` + baseurl + encodeURIComponent(cert_id) + `"><b>` + cert_id + `</b></a></div>
</div>
</div><br>Issued by <a target='_blank' href='`+ universityUrl + encodeURIComponent(cert_id.split("//")[0]) + `'>` + cert_id.split("//")[0] + `</a> .<br>`
}

async function certificatesinit() {
  var submitbtn = document.getElementById("upload_btn");
  var form = document.getElementById("upload_form");

  var resp = await academic_ecertificates_actor.getUniversity([]);
  console.log(resp);
  var finalCertificates = [];
  if (resp.statusCode === BigInt(200)) {
    var certificates = resp.certs[0];
    if (certificates) {
      for (var i = 0; i < certificates.length; i++) {
        var cert = certificates[i];
        var sno = i + 1;
        console.log(sno)
        cert.sno = sno;
        cert.grad_date = DateToMonthFormat(cert.grad_date);
        finalCertificates.push(cert)
      }
    }
    console.log(finalCertificates);
    $("#example").dataTable({
      data: finalCertificates,
      columns: [
        { data: "sno" },
        { data: "name" },
        { data: "regd_no" },
        { data: "branch" },
        { data: "grad_date" },
        {
          data: "id",
          render: function (data, type, row) {
            return `<i class="fa-solid fa-eye" onclick="openModal('` + data + `')" data-id="` + data + `"></i>`;
          }
        },
      ],
      columnDefs: [{ orderable: false, targets: 5 }],
      order: [[0, "asc"]]
    });
    $("i[data-id]").on('click', async function (e) {
      var uuid = $(this).attr("data-id");
      var resp = await academic_ecertificates_actor.getCertificate(uuid);
      console.log(resp);
      if (resp.statusCode == BigInt(200)) {
        var baseurl = process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}.icp0.io/?cert=`
          : `http://127.0.0.1:4943/?canisterId=${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}&cert=`;
        var universityUrl = process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}.icp0.io/university.html?principal=`
          : `http://127.0.0.1:4943/university.html?canisterId=${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}&principal=`;
        var cert = render_certificate(baseurl, universityUrl, resp.cert[0].name, resp.cert[0].regd_no, resp.cert[0].branch, resp.cert[0].grad_date, resp.cert[0].id);
        $("#modalbody").html(cert);
        $("#modalopen").click();
      } else {
        createtoast(resp.msg);
      }
    });
  } else {
    redirect("/register.html", { msg: resp.msg });
  }
  submitbtn.addEventListener("click", async function (event) {
    if (!form.checkValidity()) {
      var resetsbtn = document.getElementById("org_sub");
      resetsbtn.click();
    } else {
      $('#loading_icon').html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>');
      var resp = await academic_ecertificates_actor.addCertificate($("#name").val(), $("#rollno").val(), $("#branch").val());
      $('#loading_icon').html('');
      if (resp.statusCode === BigInt(200)) {
        redirect("/certificates.html", { msg: "Created Certificate with ID " + resp.msg });
      } else {
        redirect("/", { msg: resp.msg });
      }
    }
  });
}

async function universityinit() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('principal')) {
    var universityPrincipal = decodeURIComponent(url.searchParams.get('principal'))
    var resp = await academic_ecertificates_actor.getUniversity([Principal.fromText(universityPrincipal)]);
    console.log(resp);
    if (resp.statusCode === BigInt(200)) {
      var university = resp.university[0];
      var certificates = resp.certs[0];
      console.log(certificates);

      document.getElementById("uname").innerText = university.name;
      document.getElementById("uaddress").innerText = university.address;
      document.getElementById("uphno").innerText = university.phno;
      document.getElementById("uemail").innerText = university.email;
      document.getElementById("uestd_yr").innerText = university.estd_yr;
    }
    else {
      createtoast(resp.msg);
    }
  } else {
    createtoast("Invalid Access to the Page.\nUniversity Principal is Required.");
  }
}



const init = async () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has('msg')) {
    createtoast(decodeURIComponent(url.searchParams.get('msg')));
  }

  persistCannisterId("c2lt4-zmaaa-aaaaa-qaaiq-cai");
  //adding event listeners for ic_interfaces
  for (var i = 0; i < ic_interface.length; i++) {
    var interfac = ic_interface[i];
    interfac.addEventListener('click', ic_interface_click)
  }

  //creating authclient
  authClient = await AuthClient.create();

  //vadilating wallect connection
  if (await authClient.isAuthenticated()) {
    await handleAuthenticated(authClient);
  } else {
    if (window.location.pathname != "/" && window.location.pathname != "/university.html") {
      redirect("/");
    }
    setDisonnected();
    academic_ecertificates_actor = academic_ecertificates_backend;
  }

  if (url.searchParams.has('cert')) {
    var uuid = decodeURIComponent(url.searchParams.get('cert'));
    $('#cert_id').val(uuid);
    try {
      var resp = await academic_ecertificates_actor.getCertificate(uuid);
      console.log(resp);
      if (resp.statusCode == BigInt(200)) {
        var baseurl = process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}.icp0.io/?cert=`
          : `http://127.0.0.1:4943/?canisterId=${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}&cert=`;
        var universityUrl = process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}.icp0.io/university.html?principal=`
          : `http://127.0.0.1:4943/university.html?canisterId=${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}&principal=`;
        var cert = render_certificate(baseurl, universityUrl, resp.cert[0].name, resp.cert[0].regd_no, resp.cert[0].branch, resp.cert[0].grad_date, resp.cert[0].id);
        $("#cert_container").html(cert);
        createtoast(resp.msg);
      } else {
        createtoast(resp.msg);
      }
    } catch (error) {
      createtoast("Invalid ID Provided");
    }
  }

  $("#verify_btn").on('click', async function (e) {
    e.preventDefault();
    var form = document.getElementById('cert_form');
    if (form.checkValidity()) {
      var id = $('#cert_id').val();
      var resp = await academic_ecertificates_actor.getCertificate(id);
      console.log(resp);
      if (resp.statusCode == BigInt(200)) {
        var baseurl = process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}.icp0.io/?cert=`
          : `http://127.0.0.1:4943/?canisterId=${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}&cert=`;
        var universityUrl = process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}.icp0.io/university.html?principal=`
          : `http://127.0.0.1:4943/university.html?canisterId=${process.env.ACADEMIC_ECERTIFICATES_FRONTEND_CANISTER_ID}&principal=`;
        var cert = render_certificate(baseurl, universityUrl, resp.cert[0].name, resp.cert[0].regd_no, resp.cert[0].branch, resp.cert[0].grad_date, resp.cert[0].id);
        $("#cert_container").html(cert);
        createtoast(resp.msg);
      } else {
        createtoast(resp.msg);
      }
    }
    else {
      form.reportValidity();
    }
  });

  if (window.location.pathname == "/register.html") {
    await registerinit();
  } else if (window.location.pathname == "/profile.html") {
    await profileinit();
  } else if (window.location.pathname == "/certificates.html") {
    await certificatesinit();
  } else if (window.location.pathname == "/university.html") {
    await universityinit();
  }
};



document.addEventListener('DOMContentLoaded', init);


