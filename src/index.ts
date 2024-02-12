import express, {Express, Request, Response} from "express";

const app : Express = express();
const port: number = 3000;

app.use(express.json());

app.post("/github-event", (req: Request, res: Response) => {
  const { body } = req;
  const { action, sender, repository, issue, ref} = body
  const event = req.get('X-GitHub-Event');
  let message;

  switch (event) {
    case "star":
      message = `${sender.login} starred ${repository.full_name}`;
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

  res.status(200).json({succes: true});

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});