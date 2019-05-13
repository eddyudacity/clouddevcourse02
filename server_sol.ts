import express from 'express';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

(async () => {

  const app = express();
  const port = 8082; // default port to listen
  
  app.use(bodyParser.json());
  
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  async function downloadFile(url: string) {
    const filename = 'tmp/'+Math.floor(Math.random() * 2000)+'.jpg';
    const file = await fs.createWriteStream(path.join(__dirname,filename), {flags: 'w'});
    const request = await http.get(url, function(response) {
      response.pipe(file);
    });

    return filename;
  }

  async function postbackFile(url: string, filename: string) {
        // TODO   
  }

  // Root URI call
  app.post( "/imagetoprocess", async ( req, res ) => {

    const { image_url, upload_image_signedUrl } = req.body;
    
    if(!image_url) { // todo regex that they are urls
      return res.status(422).send(`image_url is required`);
    }

    const file = await downloadFile(image_url);
    // TODO catch errors

    // process
    const pythonProcess = spawn('python3', ["src/image_filter.py", "/"+file]);
    
    let python;
    if(pythonProcess !== undefined) {
      python = await pythonProcess.stdout.on('data', (data) => {
        // Do something with the data returned from python script
        return console.log(data.toString())
      });
    }

    console.log(python)

    //TODO postback if 
    // if(upload_image_signedUrl) {
    //   postbackFile(url, )

    // }

    // finally respond with the file
    // res.download(path.join(__dirname,file))

    res.send('dx')
    //delete from disk
    fs.unlinkSync(path.join(__dirname,file));
    fs.unlinkSync(path.join(__dirname, path.join('out', file)));
  } );
  
  // Root URI call
  app.get( "/", async ( req, res ) => {
    res.send("try the correct endpoint")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();