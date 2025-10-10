<script>
    import { isaObj } from '@/stores/isa.js';

    import { appstate } from '@/stores/appstate';
    import { config } from '@/stores/config';

    import Schemas from '@/lib/schemas.js';


    async function startWizardMode() {
        if (Object.keys($isaObj).length == 0) {
            let emptyInvestigation = Schemas.getMiappeInvestigation(config.prefill);
            $isaObj = emptyInvestigation;
        }

        $appstate = appstate.WIZARD;
    }

    async function addInvestigation() {
        if (Object.keys($isaObj).length === 0) {
            let emptyInvestigation = Schemas.getMiappeInvestigation(config.prefill);
            $isaObj = emptyInvestigation;
        }

        $appstate = appstate.FORM;
    }

    function loadIsaFromJson() {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = () => {

            let fileLoaded = (e) => {
                let lines = e.target.result;
                let json = JSON.parse(lines);
                $isaObj = json;
                isaObj.addProxies();
                $appstate = appstate.GUI;
            }

            let fr = new FileReader();
            fr.onload = fileLoaded;
            fr.readAsText(input.files[0]);
        };
        input.click();
    }
</script>


<section>
    <div class="box">
        <div>
            <img id="logo" src="data/logo.png" alt="MIAPPE Wizard Logo" />
            <h1>Welcome to the MIAPPE Wizard</h1>
            <!--<p>A biologist-friendly application for creating MIAPPE-compliant metadata for plant phenotyping experiments.</p>-->
            <button on:click|preventDefault={() => startWizardMode()}>Start Questionnaire mode</button> <br />
            <button on:click|preventDefault={() => addInvestigation()}>Start Expert mode</button> <br />
            <button on:click|preventDefault={() => loadIsaFromJson()}>Load ISA-JSON from file</button>
        </div>
    </div>
</section>


<style>
    section {
        height: 100%;
        background: rgb(200,200,200);
    }
    .box {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .box div {
        width: 600px;
        border-radius: 10px;
        text-align: center;
        padding: 50px;
        /*background: rgb(240,240,240);*/
        background: white;
        border: 1px solid rgb(200,200,200);
        box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
    }
    #logo {
        width: 200px;
        height: 200px;
    }
    h1 {
        font-weight: normal;
        font-size: 200%;
        margin-bottom: 1rem;
    }
    p {
        font-style: italic;
        color: rgb(70,70,70);
        margin-bottom: 4rem;
    }
    button {
        display: block;
        width: 100%;
        border: none;
        /*background-color: rgb(13, 121, 58);*/
        /* background: linear-gradient(0deg, hsl(145, 83%, 22%) 0%, hsl(145, 83%, 32%) 100%); */
        background: linear-gradient(0deg, hsl(145, 83%, 28%) 0%, hsl(145, 83%, 38%) 100%);
        /*background: rgb(150,150,150);*/

        padding: 14px 28px;
        font-size: 16px;
        cursor: pointer;
        text-align: center;
        color: white;
        border-radius: 6px;
        box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    button:hover {
        background-color: rgb(50, 75, 150);
        background: linear-gradient(0deg, hsl(145, 86%, 33%) 0%, hsl(145, 86%, 43%) 100%);
    }
</style>
