const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');
let initial = true;
let isChangingBeforeLoad = true;
canvas.width = innerWidth;
canvas.height = innerHeight;
let spawnInterval;
let isBgPlaying = true;
let sound = new Audio();
sound.src = "./sfx/background.wav";

let highScore=+localStorage.getItem('highScore');

let onLoadHighScoreElement = document.querySelector(".high_score");
let replayHighScoreElement = document.querySelector(".replay_high_score");
replayHighScoreElement.textContent=highScore;
onLoadHighScoreElement.textContent = highScore;

class Player{
    constructor(x,y,r,color){
        this.x = x;
        this.y = y;
        this.r = r;
        this.color =color;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y, this.r, 0, Math.PI*2,false);
        ctx.fillStyle = this.color;
        ctx.fill()
    }
}

class Projectile {
	constructor(x, y, r,velocity,color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.velocity = velocity;
		this.color = color;
	}
    draw_projectile(){
        ctx.beginPath();
        ctx.arc(this.x, this.y,this.r,0,Math.PI*2,false);
        ctx.fillStyle=this.color;
        ctx.fill();
        
    }
    update(){
        this.draw_projectile();
        this.x = this.x+this.velocity.x;
        this.y = this.y+this.velocity.y;
    }
}

class Enemy{
    constructor(x,y,r,velocity,color){
        this.x = x;
        this.y=y;
        this.r = r;
        this.velocity = velocity;
        this.color=color;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r,0,Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x =this.x+this.velocity.x;
        this.y = this.y+this.velocity.y;
    }
}
let projectiles = [];
let enemies = [];

function fireClickHandler(e){
    e.stopPropagation();
    e.preventDefault();
    
	const angel = Math.atan2(
		e.clientY - canvas.height / 2 ,
		e.clientX - canvas.width / 2
	);
	const velocity = {
		x: Math.cos(angel)*8,
		y: Math.sin(angel)*8,
	};
	let fire = new Audio();
	fire.src = "./sfx/weapon.wav";
	fire.play();
	projectiles.push(
		new Projectile(
			canvas.width / 2,
			canvas.height / 2,
			4,
			velocity,
			"rgb(177, 60, 6)"
		)
	);
};
let animationId;
let x = canvas.width / 2;
let y = canvas.height / 2;
const player = new Player(x, y, 10, "rgb(177, 60, 6)");
let playerScore=0;


const creatColor = () => {
	return `rgb(${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 255)}
    )`;
};

function spawnEnemies(){
    spawnInterval = setInterval(() => {
		let random = Math.random();
		const radius = random * 30 < 8 ? 8 : random * 30;
		let x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
		let y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}

		const color = creatColor();
		const angel = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
		const velocity = {
			x: Math.cos(angel),
			y: Math.sin(angel),
		};
		enemies.push(new Enemy(x, y, radius, velocity, color));
	}, 1000);
}

const animate=()=>{
    animationId =requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width, canvas.height);
    player.draw();
    enemies.forEach((enemy,idx)=>{
        enemy.update();
        const dist = Math.hypot(
				player.x - enemy.x,
				player.y - enemy.y
			);
			if (dist - player.r - enemy.r < -5) {
				cancelAnimationFrame(animationId);
                clearInterval(spawnInterval);
                const modal = document.querySelector(".hideModal");
                modal.className = "modal";
                highScore = +localStorage.getItem("highScore");
                modal.querySelector(".score").textContent = playerScore;
				const manDown = new Audio();
                manDown.src='./sfx/mandown.wav';
                manDown.play();
                setTimeout(()=>{
                    const gameOver = new Audio();
					gameOver.src = "./sfx/gameover.wav";
					gameOver.play();
                    setTimeout(() => {
                        const btnSound = new Audio();
                        btnSound.src = "./sfx/replaySfx.wav";
                        btnSound.play();
                    }, 1000);
                    setTimeout(()=>{
                        let re_play_prompt = document.querySelector(".hideScore");
                        re_play_prompt.className ="user_message";
                        if (playerScore > highScore) {
							localStorage.setItem("highScore", playerScore);
                            re_play_prompt
								.querySelector("h2")
								.insertAdjacentHTML(
									"afterend",
									`<span class="recordBroken">You Are Now A high Score Holder ${playerScore}</span>`
								);
                            replayHighScoreElement.textContent=playerScore;
						}else{
                            replayHighScoreElement.textContent=highScore;
                        }
                        const replayGame = document.querySelector(".user_message button");
                        replayGame.addEventListener("click", resetGame);
                    },1500)
                },1000);
			}
        projectiles.forEach((projectile,index)=>{
            const dist = Math.hypot(
				projectile.x - enemy.x,
				projectile.y - enemy.y
			);
			if (dist-projectile.r-enemy.r < 1) {
                const scoreLiveUpdaterElement =
					document.querySelector(".score_updater span");
                if(enemy.r>=18){
                    enemies[idx].r-=10;
                    projectiles.splice(index, 1);
                    playerScore+=100;
                }else{
                    playerScore+=150;
                    setTimeout(() => {
						projectiles.splice(index, 1);
						enemies.splice(idx, 1);
					}, 0);
                }
                scoreLiveUpdaterElement.textContent=playerScore;
			}
        })
    })
    projectiles.forEach((projectile,idx) => {
        projectile.update();
        if (
			projectile.x - projectile.r < 0 ||
			projectile.x + projectile.r > canvas.width ||
            projectile.y -projectile.r<0 || 
            projectile.y+projectile.r > canvas.height
		) {
            projectiles.splice(idx, 1)
		}
    });
}


document.querySelector(".canvasContainer").addEventListener("click", fireClickHandler);
function resetGame(e){
    e.preventDefault();
    e.stopPropagation();
    const modal = document.querySelector(".modal");
	let span = modal.querySelector(".recordBroken");
    if(span){
        span.remove();
    }
	modal.className = "hideModal";
    playerScore = 0;
    highScore = +localStorage.getItem('highScore');
    document.querySelector(".score_updater span").textContent=playerScore;
    document.querySelector(".user_message").className = "hideScore";
    
    projectiles = [];
	enemies = [];
    spawnEnemies(); 
    animate();
}
function playBtnHandler(e) {
    document.querySelector(".Play-modal").className='hideModal';
    spawnEnemies();
    animate();
    initial = false;
    let muteBtn = document.querySelector(".mute img");
    if (localStorage.getItem("isMuted")){
        isBgPlaying=false;
        muteBtn.src = "./icons/muted1.png";
        return;
    }
    sound.play();
    sound.loop = true;
    muteBtn.src = "./icons/unmuted.png";
}
document.querySelector(".start-game").addEventListener('click', playBtnHandler);

const muteBgMusic = document.querySelector(".mute");

muteBgMusic.addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    
    let muteBtn = document.querySelector('.mute img');
    if (initial && isChangingBeforeLoad) {
		sound.play();
		sound.loop = true;
		if (localStorage.getItem("isMuted")) {
			localStorage.removeItem("isMuted");
		}
		isChangingBeforeLoad = false;
		muteBtn.src = "./icons/unmuted.png";
	} else if (initial && !isChangingBeforeLoad) {
		sound.pause();
		localStorage.setItem("isMuted", true);
		muteBtn.src = "./icons/muted1.png";
		isBgPlaying = false;
		isChangingBeforeLoad = true;
	} else if (isBgPlaying && !initial) {
		isBgPlaying = !isBgPlaying;
		sound.pause();
		muteBtn.src = "./icons/muted1.png";
		localStorage.setItem("isMuted", "true");
	} else {
		isBgPlaying = !isBgPlaying;
		sound.play();
		muteBtn.src = "./icons/unmuted.png";
		localStorage.removeItem("isMuted");
	}
})




















// let pos = document.querySelector(".square");
// class Player{
//     constructor(x,y){
//         this.x=x;
//         this.y=y;
//     }
//     update(){
//         let top;
// 		let left;
// 		pos.style.position = "absolute";
// 		if (this.x + pos.clientWidth > innerWidth) {
// 			left = innerWidth - pos.clientWidth;
// 		} else if (this.x + pos.clientWidth <= innerWidth) {
// 			left = this.x;
// 		}
// 		if (this.y + pos.clientHeight > innerHeight) {
// 			top = innerHeight - pos.clientHeight;
// 		} else if (this.y + pos.clientHeight <= innerHeight) {
// 			top = this.y;
// 		}
// 		pos.style.left = left + "px";
// 		pos.style.top = top + "px";
//     }
// }
// window.addEventListener('click',(event)=>{
//     const player = new Player(event.clientX, event.clientY);
//     clickPosition.push(player);
//     player.update();
// })
