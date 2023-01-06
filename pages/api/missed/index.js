import datastore from "../../../services/datastore"
import { addtag, createGhlContact, createTag, getcontact } from "../../../services/ghl";

const searchcontact = async (number, token) => {
    let r = await fetch(`https://rest.gohighlevel.com/v1/contacts/lookup?phone=${number}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    let res = await r.text();
    return res;
}

// check if the locationId exists in database
export default async function type(req, res) {
    res.status(200).send("200");
    console.log('Request body from twilio flow : ', req.body);
    /* req.body = {
        "tags":"text_back", // the tag that is mentioned in the twilio flow
        "caller": {{trigger.call.From}} , // the number called from
        "to": {{trigger.call.To}} , ;// the number called to i.e. our twilio number
        "flow_sid": {{flow.sid}} // the flow sid of the flow that was called
        } 
    eg- {
        "tags":"textback",
        "caller": +13107210117 ,
        "to": +19514066588 ,
        "flow_sid": FN165b5b6cdf982a18e8e4e1d4941e25e0
        }
        */
    let tags = req.body.tags;
    let caller = req.body.caller;
    let to = req.body.to;
    let flow_sid = req.body.flow_sid;

    try {
        var loc = await datastore.FilterEquals("locations", "sid", flow_sid);
        loc = loc[0];
        if (Object.keys(loc).length === 0) {
            console.log("location not found");
            return;
        }
        var v1api = loc.ghlv1api;
        try {
            await createTag(tags, v1api);
        } catch (e) {
            console.log("Tag error on attempt : ", e.message);
        }
        let contact_id = await searchcontact(caller, v1api);
        contact_id = contact_id.contacts[0].id;
        if (contact_id === null) {
            try {
                contact_id = await createGhlContact(caller, v1api);
                contact_id = contact_id.contact.id;
            } catch (e) {
                console.log("Error in creating contact :", e.message);
                return;
            }
        }
        await addtag(contact_id, tags, v1api);
    } catch (e) {
        console.log(e.message);
        return;
    }
}