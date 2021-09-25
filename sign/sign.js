// $.ajax({
//   method:"GET",
//   url: "/sign/sign.css",
//   contentType: "text/css;charset=utf-8",
// }).then((e)=>{
//   let style=document.createElement("style")
//   style.innerHTML=e
//   document.head.appendChild(style)
// })
const $sign = $("#signForm");
$sign.on("submit", (e) => {
  e.preventDefault();
  let name = $sign.find("input[name=name]").val();
  let password = $sign.find("input[name=password]").val();
  if (name === "") {
    alert("请输入用户名");
  } else if (password === "") {
    alert("请输入密码");
  } else {
    $.ajax({
      method: "POST",
      url: "/sign",
      contentType: "text/json;charset=utf-8",
      data: JSON.stringify({ name, password }),
    }).then((e) => {
      alert(e);
      window.open("/home.html");
    }),
      (e) => {
        console.log(e);
      };
  }
});
