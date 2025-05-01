function welcomeUser(user) {
	return `Hello, ${user.name}!`;
}

console.log(welcomeUser({ name: "Alice" }));
