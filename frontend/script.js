
let activities = [];
let idx = 0;
const api = "https://daily-activity-tracker-wlbr.onrender.com/api/";
//load all tasks
async function loadAll(){
    try{
        const res=await fetch(`${api}/api/activities`);
        activities=await res.json();
        document.getElementById("activity-card").style.display = "flex";
        document.getElementById("activity-status-box").innerHTML =
        "<span>Loading...</span>";
        if (!activities.length) {
            document.getElementById("icon").innerHTML = "";
            document.getElementById("title").innerText = "No Tasks";
            document.getElementById("time").innerText = "";
            document.getElementById("activity-status-box").innerHTML = "";
            return;
        }
        idx = Math.min(idx, activities.length - 1);
        renderAll();
    }
    catch(err){
        console.log(err);
    }
}
// async function loadAll() {
//     try{
//         const res = await fetch(`${api}/activities`);
//         activities = await res.json();

//         if (!activities.length) {
//             document.getElementById("icon").innerHTML = "";
//             document.getElementById("title").innerText = "No Tasks";
//             document.getElementById("time").innerText = "";
//             document.getElementById("activity-status-box").innerHTML = "";
//             return;
//         }

//         idx = 0;
//         renderAll();
//         // renderStatus(activities[idx].completed);
//         // addtask();
//     }catch(err){
//         console.log("Error Fetching Activity:",err);
//     }
// }
//render all tasks
function renderAll(){
    renderTask();
    renderDots();
    trackprogress();
    drawChart();
}
//render current task
function renderTask() {
    const data = activities[idx];

    document.getElementById("icon").innerHTML =
        `<span class="material-symbols-outlined">${data.icon}</span>`;

    document.getElementById("title").innerText = data.title;

    document.getElementById("time").innerHTML =
        `<span class="material-symbols-outlined">
            nest_clock_farsight_analog
        </span> ${data.time}`;

    document.getElementById("activity-status-box").innerHTML = `
        <input
            type="checkbox"
            id="done-checkbox"
            ${data.completed ? "checked" : ""}
        >
        Completed
        <br><br>

        <button id="delete-btn">
            Delete
        </button>
    `;

    attachCheckboxListener();
    attachDeleteListener();
}
// function renderTask(){
//     const data = activities[idx];

//     document.getElementById("icon").innerHTML =
//         `<span class="material-symbols-outlined">${data.icon}</span>`;

//     document.getElementById("title").innerText = data.title;

//     document.getElementById("time").innerHTML =
//         `<span class="material-symbols-outlined">nest_clock_farsight_analog</span> ${data.time}`;

//     document.getElementById("activity-status-box").innerHTML = `
//         <input type="checkbox" class="task-checkbox" ${data.completed ? "checked" : ""}>
//         Completed
//         <br>
//         <button id="delete-btn">Delete</button>`;
//     attachCheckboxListener();
//     attachDeleteListener();
// }
//task status update
function attachCheckboxListener() {
    const checkbox = document.querySelector("#activity-status-box #done-checkbox");

    if (!checkbox) return;

    checkbox.onchange = async (e) => {
        try {
             
            const completed = e.target.checked;

            const res = await fetch(`${api}/activity/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: activities[idx]._id,
                    completed: e.target.checked
                })
            });

            if (!res.ok) {
                throw new Error("Update failed");
            }

            activities[idx].completed = e.target.checked;
            console.log(activities[idx]);
            trackprogress();
            // await loadAll();
        } catch (err) {
            console.log("Update Failed:", err);
        }
    };
}
//delete any task
function attachDeleteListener() {
    const btn = document.getElementById("delete-btn");

    if (!btn) return;

    btn.onclick = async () => {
        try {
            const id = activities[idx]._id;

            await fetch(`${api}/activity/${id}`, {
                method: "DELETE"
            });

            // remove from local array
            activities.splice(idx, 1);

            if (activities.length === 0) {
                idx = 0;
                renderEmptyState();
                return;
            }

            // adjust index safely
            if (idx >= activities.length) {
                idx = Math.max(0, activities.length - 1);
            }

            renderAll();
        } catch (err) {
            console.log("Delete Failed:", err);
        }
    };
}
//last card delete
function renderEmptyState() {
    document.getElementById("icon").innerHTML = "";
    document.getElementById("title").innerText = "No Tasks Available";
    document.getElementById("time").innerText = "";

    document.getElementById("activity-status-box").innerHTML = "";

    document.getElementById("total").innerText = "0";
    document.getElementById("done").innerText = "0";
    document.getElementById("left").innerText = "0";
    document.getElementById("growth").innerText = "0%";

    document.getElementById("progress-bar").style.width = "0%";

    document.getElementById("dots").innerHTML = "";
}
//dot navigation
function renderDots(){
    const dotContainer = document.getElementById("dots");
    dotContainer.innerHTML = "";

    activities.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if(i == idx){dot.classList.add("active");}

        dot.addEventListener("click",() => {
            idx = i;
            renderAll();
        });

        dotContainer.appendChild(dot);
    })
}
//prev/next-btn
document.getElementById("next-btn").addEventListener("click",() => {
        if (!activities.length) return;

        idx = (idx + 1) % activities.length;
        renderAll();
});
document.getElementById("prev-btn").addEventListener("click",() => {
        if (!activities.length) return;

        idx = (idx - 1 + activities.length) % activities.length;
        renderAll();
})

//render status
// function renderStatus(isDone) {
//     const statusBox = document.querySelector("#activity-status-box");
//     if (!statusBox) return;

//     statusBox.innerHTML = `
//         <input type="checkbox" id="done-checkbox" ${isDone ? "checked" : ""}>
//         Completed
//     `;

//     attachCheckboxListener();
//     // const statusBox = document.querySelector("#status-box");

//     // if (isDone) {
//     //     statusBox.innerHTML = "✔ Completed";
//     // } else {
//     //     statusBox.innerHTML = `
//     //         <input type="checkbox" id="done-checkbox"> Completed
//     //     `;
//     //     attachCheckboxListener();
//     // }
// }
//progress tracker
function trackprogress(){
    const total = activities.length;
    const done = activities.filter(a => a.completed).length;
    const left = total - done;
    const percent = total ? Math.round((done / total) * 100) : 0;

    const totalEl = document.getElementById("total");
    const doneEl = document.getElementById("done");
    const leftEl = document.getElementById("left");
    const growthEl = document.getElementById("growth");

    if (!totalEl || !doneEl || !leftEl || !growthEl) return;

    totalEl.innerText = total;
    doneEl.innerText = done;
    leftEl.innerText = left;
    growthEl.innerText = percent + "%";

    const bar = document.getElementById("progress-bar");
    if (bar) bar.style.width = percent + "%";

    // const totalEl = document.getElementById("total");
    // const doneEl = document.getElementById("done");
    // const leftEl = document.getElementById("left");
    // const growthEl = document.getElementById("growth");

    // if (!totalEl || !doneEl || !leftEl || !growthEl) {return;}

    // totalEl.innerHTML = total;
    // doneEl.innerHTML = cnt;
    // leftEl.innerHTML = total - cnt;
    // growthEl.innerHTML = percent + "%";

    // const bar = document.getElementById("progress-bar");
    // if (bar) { bar.style.width = percent + "%";}
    drawChart();
}
//add new task
document.getElementById("add").addEventListener("click", async () => {

    const icon = document.getElementById("inp-icon").value.trim();
    const title = document.getElementById("inp-title").value.trim();
    const time = document.getElementById("inp-time").value;
    const completed = document.getElementById("inp-status").checked;
    if(!title|| !icon){
        alert("Please enter Task Icon and Title");
        return;
    }
    const activity = {icon,title,time,completed};
    try {
           await fetch(`${api}/activity/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ icon, title, time, completed })
            });

            // await loadAll();
        document.getElementById("inp-icon").value = "";
        document.getElementById("inp-title").value = "";
        document.getElementById("inp-time").value = "";
        document.getElementById("inp-status").checked = false;
        await loadAll();

    } catch (err) {
        console.log("Add Failed:",err);
    }
});
let progressChart = null;
function drawChart() {

    const total = activities.length;
    const done = activities.filter(a => a.completed).length;
    const left = total - done;

    const ctx = document.getElementById("statsChart");

    if(progressChart){
        progressChart.destroy();
    }

    progressChart = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:["Completed","Pending"],
            datasets:[{
                data:[done,left]
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    position:"bottom"
                }
            }
        }
    });

}
loadAll();