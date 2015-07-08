#!/bin/sh
while true; do
        ps auxw | grep "/usr/bin/nodejs /home/ezeonetalent/ezeid/bin/www" | grep -v grep > /dev/null

        if [ $? != 0 ]
        then
                echo $(date -u) "Not running" >> /var/log/ezeone.log
                service ezeid2 restart >> /var/log/ezeone.log
                sleep 5
        else
                echo "Running" >> /var/log/ezeone.log
        fi

        sleep 2
done
