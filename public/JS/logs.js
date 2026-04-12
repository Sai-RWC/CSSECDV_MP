
let allLogs = LOG_DATA || [];
let page = 1;
const PAGE_SIZE = 20;

function fmtTs(ts) {
    const d = new Date(ts);
    if (isNaN(d)) return ts || '—';
    return d.toLocaleString('en-PH', {
        month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    });
}

function getDetails(entry) {
    const skip = new Set(['level', 'message', 'timestamp']);
    return Object.entries(entry)
        .filter(([k]) => !skip.has(k))
        .map(([k, v]) => `<span style="color:#374151">${k}:</span> ${v}`)
        .join(' &nbsp;·&nbsp; ');
}

function filtered() {
    const q     = document.getElementById('search').value.toLowerCase();
    const level = document.getElementById('levelFilter').value;
    const sort  = document.getElementById('sort').value;

    let logs = allLogs.filter(l => {
        if (level && l.level !== level) return false;
        if (q && !JSON.stringify(l).toLowerCase().includes(q)) return false;
        return true;
    });

    logs.sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return sort === 'asc' ? ta - tb : tb - ta;
    });

    return logs;
}

function render() {
    page = 1;
    renderPage();
}

function renderPage() {
    const logs  = filtered();
    const total = logs.length;
    const start = (page - 1) * PAGE_SIZE;
    const slice = logs.slice(start, start + PAGE_SIZE);

    const body  = document.getElementById('logBody');
    const empty = document.getElementById('emptyState');

    if (!slice.length) {
        body.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        body.innerHTML = slice.map(entry => {
            const lvl = entry.level || 'info';
            const badgeClass = lvl === 'warn' ? 'badge-warn'
                : lvl === 'error' ? 'badge-error'
                : 'badge-info';
            const details = getDetails(entry);
            return `<tr>
                            <td class="ts">${fmtTs(entry.timestamp)}</td>
                            <td><span class="badge ${badgeClass}">${lvl}</span></td>
                            <td class="msg">${entry.message || '<span class="no-msg">—</span>'}</td>
                            <td class="meta">${details}</td>
                        </tr>`;
        }).join('');
    }

    const pages = Math.ceil(total / PAGE_SIZE) || 1;
    document.getElementById('pageInfo').textContent =
        `${start + 1}–${Math.min(start + PAGE_SIZE, total)} of ${total} entries`;
    document.getElementById('btnPrev').disabled = page <= 1;
    document.getElementById('btnNext').disabled = page >= pages;
}

function changePage(dir) {
    const pages = Math.ceil(filtered().length / PAGE_SIZE) || 1;
    page = Math.max(1, Math.min(pages, page + dir));
    renderPage();
}

function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('sort').value = 'desc';
    render();
}

renderPage();
