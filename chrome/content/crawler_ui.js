/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

/*
 * crawler_dialog.js
 *
 * These functions implement the user interface behaviors of the top-level control dialog.
 */

const Cu = Components.utils;

Cu.import( "resource://gre/modules/Services.jsm" );

let crawling = false;

function require( module )
{
    let result = {};
    result.wrappedJSObject = result;
    Services.obs.notifyObservers( result, "abpcrawler-require", module );
    return result.exports;
}

let {Crawler} = require( "crawler" );

function onUnload()
{
    const fields = ["backend-url", "parallel-tabs"];
    fields.forEach( function ( field )
    {
        let control = document.getElementById( field );
        control.setAttribute( "value", control.value );
    } );
}

function getBackendUrl()
{
    let backendUrlTextBox = document.getElementById( "backend-url" );
    return backendUrlTextBox.value;
}

function getParallelTabs()
{
    let parallelTabsTextBox = document.getElementById( "parallel-tabs" );
    return parseInt( parallelTabsTextBox.value );
}

function onAccept()
{
    let backendUrl = getBackendUrl();
    let parallelTabs = getParallelTabs();
    let dialog = document.documentElement;
    let acceptButton = dialog.getButton( "accept" );
    crawling = acceptButton.disabled = true;

    let mainWindow = window.opener;
    if ( !mainWindow || mainWindow.closed )
    {
        alert( "Unable to find the main window, aborting." );
        crawling = acceptButton.disabled = false;
    }
    else
        Crawler.crawl( backendUrl, parallelTabs, mainWindow, function ()
        {
            crawling = acceptButton.disabled = false;
        } );

    return false;
}

function onCancel()
{
    let closingPossible = !crawling;
    if ( !closingPossible )
        alert( "Crawling still in progress." );
    return closingPossible;
}
