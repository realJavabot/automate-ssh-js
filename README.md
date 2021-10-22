# automate-ssh-js

To install run the following command:

`npm install`

The commands go in request.json. The request object maps headers to shell commands. When they are executed on the systems, the standard output gets saved. request.json also has login credentials, which are mapped to the values of the dropdown in the html.

To use as-is, run:

`./server.js`

and this will run the webpage on localhost:3000

Enter the ips comma or newline deliminated (no spaces) as in:

`10.0.0.1,10.0.0.2,10.0.0.3 `

or

`10.0.0.1

10.0.0.2

10.0.0.3 `

Use the dropdown to select proper login credentials (check request.json) and press "Fetch Inventory". This will take a couple of seconds. The output will be displayed on the right once it has finished, and any errors will be logged to the output of the command you ran (`./server.js`).

You can save or open the output as a csv by pressing "SAVE".

At the moment "Uses IPMI" does nothing. The general requirements can be ignored as well, just make sure the commands in request.json are correct before running.

In order to be properly parsed the commands must have each $ written as \\$ and each space in a grep is written "\\ ".
