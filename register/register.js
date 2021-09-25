const $sign = $("#registerForm");
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
      url: "/register",
      contentType: "text/json;charset=utf-8",
      data: JSON.stringify({ name, password }),
    }).then(
      (e) => {
          alert(e)
        if (e === "注册成功") {
          window.open("/sign/sign.html");
        }
      },
      () => {}
    );
  }
});
