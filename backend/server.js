require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Activity = require("./models/Activity")

const app = express();
const PORT = 5000;
const cron = require("node-cron");
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => {console.log("MongoDB Connected");})
.catch(err => {   console.log(err); });
//fetch all tasks
app.get("/api/activities", async (req,res) => {
    try{
        const activities = await Activity.find().sort({ time : 1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({error : err.message});
    }
});
//add any task
app.post("/api/activity/add", async (req,res) => {
    try{
        const {icon,title,time,completed} = req.body;
        if(!icon || !title){
            return res.status(400).json({message : "Icon And Title Are Required!"});
        }
        const newActivity = new Activity({
            icon : icon,
            title,
            time,
            completed : completed ?? false
        });

        await newActivity.save();

        res.status(201).json(activity);

    } catch(err) {
        res.status(500).json({error : err.message});
    }
})
//update task
app.post("/api/activity/update", async (req,res) => {
     try {

        const { id, completed } = req.body;

        console.log("Incoming :", req.body);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid ID"
            });
        }

        const updated = await Activity.findByIdAndUpdate(
            id,
            {
                completed
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        console.log("Updated :", updated);

        if (!updated) {
            return res.status(404).json({
                message: "Activity not found"
            });
        }

        res.json(updated);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });

    }
    // try{
    //     console.log(req.body);

    //     const {id , completed } = req.body;
    //     if (!id) {
    //         return res.status(400).json({ message: "ID is required" });
    //     }
    //     const updated = await Activity.findByIdAndUpdate(id, {completed},{ returnDocument : 'after'});

    //     console.log(updated);
    //     if(!updated) {return res.status(404).json({message: "Activity Not Found" });}
    //     res.json(updated);
    // } catch (err) {
    //     res.status(500).json({error : err.message});
    // }
})
//get single task
app.get("/api/activity/:id", async (req,res) => {
    try{
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const activity = await Activity.findById(id);
        if(!activity){return res.status(404).json({message: "Task Not Found"});}
        res.json(activity);
    } catch (err) {
        res.status(500).json({error : err.message});
    }
})
//delete any task
app.delete("/api/activity/:id", async (req, res) => {
    try {
        const deleted = await Activity.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Activity Not Found" });
        }

        res.json({ success: true, deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

cron.schedule("0 0 * * *", async () => {

    await Activity.updateMany({}, {
        completed: false
    });

    console.log("Daily Reset Done");

});
// app.post("/api/activity/update", (req,res) => {
//     const {idx,completed} = req.body;

//     if(idx < 0 || idx >= activities.length){
//         return res.status(404).json({message: "Invalid Index"});
//     }

//     activities[idx].completed = completed;

//     res.json(activities[idx]);
// });
// app.get("/api/activities", async (req,res) => {
//     try {
//         const activities = await Activity.find();

//         res.json(activities);
//     }
//     catch(err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// })
// app.post("/api/activity/add",(req,res)=>{

//     const {icon,title,time,completed} = req.body;

//     if(!title || !time){
//         return res.status(400).json({
//             message:"Title and Time are required"
//         });
//     }

//     activities.push({
//         icon: icon || "task",
//         title,
//         time,
//         completed: completed || false
//     });

//     res.json({
//         success:true
//     });
// });
app.get("/",(req,res) => {
    res.send("Welcome to Daily Activity Tracker");
})

app.listen(PORT,() => {
    console.log(`Server Running on PORT ${PORT}`);
})