const CRITERIA_CATEGORY = 'StatCriteriaCat';
const CRITERIA_MIN = 'StatCriteriaMin';
const CRITERIA_MAX = 'StatCriteriaMax';

// WhatIf category numbers
const SEARCH_PARAMS = {
    PER_PER: 64,
    MID_PER: 65,
    PNT_PER: 66,
    PG_EFF: 10,
    SG_EFF: 11,
    SF_EFF: 12,
    PF_EFF: 13,
    C_EFF: 14
};

const CELL_POS = {
    PER_PER: 0,
    MID_PER: 1,
    PNT_PER: 2,
    PG_EFF: 4,
    SG_EFF: 5,
    SF_EFF: 6,
    PF_EFF: 7,
    C_EFF: 8
};

setCriteriaValues = (min, max, index) => {
    return `&${CRITERIA_MIN}${index}=${min}&${CRITERIA_MAX}${index}=${max}`;
};

const tblStats = document.getElementById('tbl_general');
let statRow;
if (tblStats) {
    statRow = tblStats.getElementsByClassName('odd');
}
if (statRow) {
    const url = 'playersearch.asp?pg=1&spot=1&eid=396704&pos=6&sal_min=239000&sal_max=99000000&format=2&sb=15&order=2&max=50' +
        Object.keys(SEARCH_PARAMS).map((k, index) => {
            let criteria = '';
            let ii = index + 1;
            const category = `&${CRITERIA_CATEGORY}${ii}=${SEARCH_PARAMS[k]}`;
            if (k.includes('EFF')) {
            	const min = statRow[0]['cells'][CELL_POS[k]].innerHTML;
            	const max = statRow[0]['cells'][CELL_POS[k]].innerHTML;
                criteria = setCriteriaValues(min.replace('%', ''), max.replace('%', ''), ii);
            } else {
            	let min = statRow[0]['cells'][CELL_POS[k]].innerHTML.replace('%', '');
            	let max = statRow[0]['cells'][CELL_POS[k]].innerHTML.replace('%', '');
            	min = Number.parseInt(min);
            	max = Number.parseInt(max);
            	// WhatIf stores percentages shot percentages as floats under the hood
				// we need to capture this by giving a range of 1
            	min = min > 0 ? min - 1 : min;
            	max = max < 100 ? max + 1 : max;
            	criteria = setCriteriaValues(min, max, ii);
            }
            return category + criteria;
        }).join('');

    window.open(url);
}