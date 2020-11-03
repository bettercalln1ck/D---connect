
<script src="/js/jquery-3.5.1.min.js"></script>
<script src="/js/socket.io.js"></script>

<form onsubmit="return enterName();">
  <input id="name" placeholder="Enter name">
  <input type="submit">
</form>

<ul id="users"></ul>

<ul id="messages"></ul>
	
<script>
	var io=io("https://localhost:3443");
	function enterName() {
	    // get username
	    var name = document.getElementById("name").value;

	    // send it to server
	    io.emit("user_connected", name);

	    // save my name in global variable
	    sender = name;

	    // prevent the form from submitting
	    return false;
	}

	// listen from server
	io.on("user_connected", function (username) {
		var html = "";
		html += "<li><button onclick='onUserSelected(this.innerHTML);'>" + username + "</button></li>";

		document.getElementById("users").innerHTML += html;
	});

	function onUserSelected(username) {
	    // save selected user in global variable
	    receiver = username;
	  }
</script>