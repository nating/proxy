<!doctype html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
        <script type="text/javascript" src="http://yui.yahooapis.com/combo?3.5.0/build/yui/yui-min.js"></script>
        <script type="text/javascript" src="ajax.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <title>overt-aproxymations management console</title>
        <link rel="stylesheet" type="text/css" href="style.css"/>
    </head>
    <body>
        <h1 id="bobobo">proxy management console</h1>
        <h1>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</h1>
        <div id="out"></div>
        <input id="in" tabindex="0"/>
    </body>
    <script type="text/javascript">
        YUI().use("node", function(Y) {

            var COMMANDS = [

                {
                    name: "blacklist",
                    handler: function(args) {
                        updateBlacklist(args);
                        outputToConsole("The following urls have been blacklisted by the server:");
                        for(var i=0;i<args.length;i++){
                            outputToConsole("\t"+args[i]);
                        }
                    }
                },

                {
                    name: "changeport",
                    handler: function(args) {
                        outputToConsole("Yeah baby: "+args[0]);
                        updatePort(args[0]);
                        outputToConsole("The port of the server has been changed to: "+args[0]);
                    }
                },

                {
                    name: "changehost",
                    handler: function(args) {
                        updateHost(args[0]);
                        outputToConsole("The host of the server has been changed to: "+args[0]);
                    }
                }
            ];

            function processCommand() {
                var inField = Y.one("#in");
                var input = inField.get("value");
                var parts = input.replace(/\s+/g, " ").split(" ");
                var command = parts[0];
                var args = parts.length > 1 ? parts.slice(1, parts.length) : [];

                inField.set("value", "");

                for (var i = 0; i < COMMANDS.length; i++) {
                    if (command === COMMANDS[i].name) {
                        COMMANDS[i].handler(args);
                        return;
                    }
                }

                outputToConsole("Unsupported Command: " + command);
                outputToConsole("Unsupported Command: " + command);
            }

            function outputToConsole(text) {
                var p = Y.Node.create("<p>" + text + "</p>");
                Y.one("#out").append(p);
                p.scrollIntoView();
            }

            Y.on("domready", function(e) {
                Y.one("body").setStyle("paddingBottom", Y.one("#in").get("offsetHeight"));
                Y.one("#in").on("keydown", function(e) {
                    if (e.charCode === 13) {
                        processCommand();
                    }
                });
            });
        });
    </script>
</html>