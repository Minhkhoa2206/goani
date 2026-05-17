import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {

    const { url } = req.query;

    if(!url){

        return res.status(400).json({
            error:"Missing URL"
        });
    }

    let browser;

    try{

        browser = await puppeteer.launch({

            args:[
                ...chromium.args,
                "--hide-scrollbars",
                "--disable-web-security",
                "--no-sandbox"
            ],

            defaultViewport:{
                width:1280,
                height:720
            },

            executablePath:
            await chromium.executablePath(),

            headless:chromium.headless
        });

        const page =
        await browser.newPage();

        // fake browser thật 😏

        await page.setUserAgent(

            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

        );

        await page.goto(url,{

            waitUntil:"networkidle2",
            timeout:60000
        });

        // đợi render

        await page.waitForTimeout(3000);

        const data =
        await page.evaluate(()=>{

            const title =
            document.querySelector("title")
            ?.innerText;

            const image =
            document.querySelector("meta[property='og:image']")
            ?.content;

            const description =
            document.querySelector("meta[property='og:description']")
            ?.content;

            return {

                title,
                image,
                description
            };
        });

        await browser.close();

        return res.status(200).json({

            success:true,
            data
        });

    }catch(err){

        console.log(err);

        if(browser){

            await browser.close();
        }

        return res.status(500).json({

            success:false,
            error:err.toString()
        });
    }
}
