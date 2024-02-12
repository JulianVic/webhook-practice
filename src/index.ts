import express, {Express, NextFunction, Request, Response} from "express";
import axios from "axios"
import * as crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const app : Express = express();
const port: number = 3000;

app.use(express.json());

const verifySignature = (req: Request) => {
  try{
    const signature = crypto.createHmac('sha256', String(process.env.GITHUB_WEBHOOK_SECRET))
      .update(JSON.stringify(req.body))
      .digest('hex');
    const trusted = Buffer.from(`sha256=${signature}`, "ascii");
    const untrusted = Buffer.from(req.header('X-Hub-Signature-256') || "", "ascii");

    return crypto.timingSafeEqual(trusted, untrusted);

  }catch(e){
    return false;
    console.log(e);
  }
}

const verifySignatureMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if(!verifySignature(req)) return res.status(401).send({success: false, msg: "Unauthorized"});
  
  next();
}

app.post("/github-event", verifySignatureMiddleware, (req: Request, res: Response) => {
  const { body } = req;
  const { action, sender, repository, issue, ref} = body
  const event = req.get('X-GitHub-Event');
  let message = "";

  switch (event) {
    case "star":
      message = `${sender.login} ${action} star in${repository.full_name}`;
      break;
    case "issues":
      message = `${action} issue ${issue.title}`;
      break;
    case "push":
      message = `${sender.login} pushed to ${ref}`;
      break;
    default:
      message = "Event not recognized";
  } 

  console.log(message);
  
  const url = `https://discord.com/api/webhooks/1206625173084569620/CpVm3NdMTveOyHoSRfIjUNOg7LpY0Hhn0I6_K8sC7mThUfEMSl5W6ZTzZhS1tYtkHzad`;
  axios.post(url, {
    content: message
  });
  res.status(200).json({succes: true});
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});