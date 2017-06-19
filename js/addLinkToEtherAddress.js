(function() {
    document.body.innerHTML = document.body.innerHTML.replace(
        new RegExp("(?!.*\")(0[xX][0-9a-fA-F]{40})(?!\")(!?<\s|\<|$)", "g"),
        `<a href="https://etherscan.io/address/$1" class="ext-etheraddresslookup-link">$1</a>$2`
    );
})();