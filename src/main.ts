import {openai} from "./openai";


const form = document.querySelector("#generate-form") as HTMLFormElement
const iframe = document.querySelector("#generated-code") as HTMLIFrameElement
form.addEventListener('submit',async (e)=>{

  e.preventDefault();
  const formData = new FormData(form);
  const prompt = formData.get('prompt') as string;

  const response = await openai.chat.completions.create({
    messages: [
      {
        role:"system",
        content:`Tu crees des site web avec tailwind.
    Ta tache est de generer du code HTML avec tailwind en fonction du prompt
    de l'utilisateur.
    Tu renvoies uniquement du HTML sans aucun texte avant ou apres.
    Tu renvoies du HTML valide.
    Tu n'ajoute jamais de syntaxe markdown.`},
    {
      role: 'user',
      content: prompt }
    ],
    model: 'gpt-3.5-turbo',
    stream:true
  });


  const createTimeUpdateFrame = () =>{
    let date = new Date();
    let timeout:any = null;
    return(code:string) =>{
      // Only call updatedIframe if last call was more than 1 second ago
      if(new Date().getTime() - date.getTime() > 1000){
        updateIFrame(code);
        date = new Date();
      }

      //clear previous timeout
      if(timeout){
        clearTimeout(timeout);
      }
      // Set new timeout
      timeout = setTimeout(() => {
        updateIFrame(code);
      }, 1000);
    }
  }
  const updateIFrame = (code:string) =>{
    iframe.srcdoc = `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tailwind Generator</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
      ${code}
      </body>
    <html>  
    ;`
  }

  let code = '';
  const onNewChunk = createTimeUpdateFrame();

  for await ( const message of response){
    const isDone = message.choices[0].finish_reason === 'stop';
    const token = message.choices[0].delta.content;
    code += token;
    onNewChunk(code);
  }

  

  
})