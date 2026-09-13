#!/usr/bin/env bash
# 고치는 사람이 커밋 전에 직접 돌립니다. 몇 초면 끝납니다.
#
# 여기 있는 검사는 전부 이 저장소에서 실제로 한 번씩 터진 것들입니다.
# 사람이나 담당이 눈으로 다시 볼 필요가 없는 것만 넣습니다 —
# 보이는 모양, 글의 내용, 안전성 판단은 여기서 못 합니다.

cd "$(dirname "$0")/.."
fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

echo "── 문법"
for f in js/*.js; do
  node --check "$f" 2>/dev/null || { bad "$f 문법 오류"; continue; }
done
[ $fail -eq 0 ] && ok "js/ $(ls js/*.js | wc -l)개 통과"

echo "── 데이터"
node -e '
const fs=require("fs");
const {CATEGORIES,MOVEMENTS}=new Function(fs.readFileSync("js/data.js","utf8")+";return{CATEGORIES,MOVEMENTS}")();
const p=[];
const ids=new Set();
MOVEMENTS.forEach(m=>{
  if(ids.has(m.id)) p.push("id 중복: "+m.id); ids.add(m.id);
  if(!/^[a-z0-9-]+$/.test(m.id)) p.push("id 형식: "+m.id);
  if(!CATEGORIES.includes(m.category)) p.push("없는 카테고리: "+m.name+" → "+m.category);
  if(!["초급","중급","고급"].includes(m.level)) p.push("난이도: "+m.name+" → "+m.level);
  ["name","nameEn","summary","breathing"].forEach(k=>{ if(!m[k]) p.push("빈 항목: "+m.id+"."+k); });
  ["targets","steps","cautions","tips","images"].forEach(k=>{ if(!Array.isArray(m[k])) p.push("배열이 아님: "+m.id+"."+k); });
});
if(p.length){ p.forEach(x=>console.log("BAD "+x)); process.exit(1); }
console.log("OK 동작 "+MOVEMENTS.length+"개 / 카테고리 "+CATEGORIES.length+"개");
' > /tmp/_chk 2>/dev/null; rc=$?
if [ $rc -eq 0 ]; then ok "$(sed -n 's/^OK //p' /tmp/_chk | head -1)"
else bad "데이터"; sed -n 's/^BAD /       /p' /tmp/_chk; fi

echo "── 인체 도식"
node -e '
const fs=require("fs"), src=fs.readFileSync("js/bodymap.js","utf8");
const {BODY_REGIONS,MUSCLE_REGIONS}=new Function(src+";return{BODY_REGIONS,MUSCLE_REGIONS}")();
const p=[];
// 범례에 보이는 이름을 그대로 적어도 그림이 나와야 합니다
Object.entries(BODY_REGIONS).forEach(([k,r])=>{
  if(!MUSCLE_REGIONS[r.label]||!MUSCLE_REGIONS[r.label].includes(k))
    p.push("라벨이 이름으로 안 통함: "+r.label+" → "+k);
});
Object.entries(MUSCLE_REGIONS).forEach(([n,rs])=>rs.forEach(r=>{
  if(!BODY_REGIONS[r]) p.push("없는 부위를 가리킴: "+n+" → "+r);
}));
if(p.length){ p.forEach(x=>console.log("BAD "+x)); process.exit(1); }
console.log("OK 이름 "+Object.keys(MUSCLE_REGIONS).length+"개 / 부위 "+Object.keys(BODY_REGIONS).length+"개");
' > /tmp/_chk 2>/dev/null; rc=$?
[ $rc -eq 0 ] && ok "$(sed -n 's/^OK //p' /tmp/_chk)" || { sed -n 's/^BAD /     /p' /tmp/_chk; bad "인체 도식 표에 문제가 있습니다"; }

echo "── 발행 왕복 (관리 화면이 data.js 를 다시 만들어도 같은가)"
node -e '
const fs=require("fs");
const o=new Function(fs.readFileSync("js/data.js","utf8")+";return{CATEGORIES,MOVEMENTS}")();
const out=["const CATEGORIES = "+JSON.stringify(o.CATEGORIES,null,2)+";","",
           "const MOVEMENTS = "+JSON.stringify(o.MOVEMENTS,null,2)+";"].join("\n");
const b=new Function(out+";return{CATEGORIES,MOVEMENTS}")();
process.exit(JSON.stringify(o)===JSON.stringify(b)?0:1);
' 2>/dev/null && ok "원본과 일치" || bad "왕복에서 데이터가 달라짐"

echo "── 관리 화면이 참조하는 변수"
node -e '
const fs=require("fs");
const c=fs.readFileSync("css/style.css","utf8"), a=fs.readFileSync("css/admin.css","utf8");
const have=new Set([...c.matchAll(/--([a-z0-9-]+)\s*:/g)].map(m=>m[1]));
const miss=[...new Set([...a.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(m=>m[1]))].filter(v=>!have.has(v));
if(miss.length){ console.log("BAD 없는 변수: "+miss.join(", ")+" (단축 속성 안에 있으면 테두리가 통째로 사라집니다)"); process.exit(1); }
console.log("OK 모두 존재");
' > /tmp/_chk 2>/dev/null; rc=$?
[ $rc -eq 0 ] && ok "$(sed -n 's/^OK //p' /tmp/_chk)" || { sed -n 's/^BAD /     /p' /tmp/_chk; bad "관리 화면이 쓰는 변수가 없습니다"; }

echo "── 관리 화면이 쓰는 레이아웃 클래스"
for cls in wrap site-header logo tagline; do
  grep -q "\.$cls\b" css/style.css || bad ".$cls 규칙이 없음 (admin.html 이 씁니다)"
done
ok "4개 모두 규칙 있음"

echo "── 색 하드코딩 (디자인 규칙 1번)"
n=$(node -e '
const fs=require("fs");
let s=fs.readFileSync("css/style.css","utf8");
s=s.replace(/\/\*[\s\S]*?\*\//g,"");          // 주석 제거
s=s.replace(/:root\s*\{[\s\S]*?\n\}/,"");     // :root 블록 제거
console.log((s.match(/#[0-9a-fA-F]{3,6}\b|rgba?\(/g)||[]).length);
')
[ "$n" -eq 0 ] && ok ":root 밖 0건" || bad ":root 밖 $n건"

echo "── padding 단축 (디자인 규칙 7번)"
p=0
for cls in $( { grep -ho 'class="[^"]*shell[^"]*"' *.html | sed 's/class="//;s/"//';
                grep -ho "className = '[^']*shell[^']*'" js/*.js | sed "s/className = '//;s/'//";
              } | tr ' ' '\n' | grep -v '^shell$\|^$' | sort -u); do
  sed -n "/^\.$cls {/,/^}/p" css/style.css | grep -q '^[[:space:]]*padding:' && { bad ".$cls 가 padding 단축 → .shell 좌우 여백 소멸"; p=1; }
done
[ $p -eq 0 ] && ok ".shell 과 겹치는 클래스 모두 안전"

echo "── 한글 줄바꿈"
grep -q 'word-break: keep-all' css/style.css && ok "keep-all 있음" || bad "word-break: keep-all 이 없음 (단어 중간에서 잘립니다)"

echo "── ch 단위 오용 (디자인 규칙)"
c=$(grep -n 'max-width: [0-9]*ch' css/style.css | wc -l)
ok "ch 사용 $c곳 (본문 크기 요소인지는 눈으로 확인)"

echo "── 등장 효과 안전망"
grep -q 'js-reveal' css/style.css && grep -q 'js-reveal' js/reveal.js \
  && grep -q 'reveal:not(.is-in)' js/reveal.js \
  && ok "기본 보임 + 안전망 있음" || bad "안전망이 사라졌습니다 (내용이 영영 안 보일 수 있음)"

echo "── 참조하는 로컬 파일이 실제로 있나"
miss=0
for f in *.html; do
  for ref in $(grep -o '\(href\|src\)="[^"#:]*"' "$f" | sed 's/.*="//;s/"//;s/?.*//' | grep -v '^http\|^$'); do
    [ -f "$ref" ] || { bad "$f → $ref 없음"; miss=1; }
  done
done
[ $miss -eq 0 ] && ok "끊어진 참조 없음"

echo
[ $fail -eq 0 ] && printf '\033[32m전부 통과\033[0m\n' || printf '\033[31m%s건 실패\033[0m\n' "$fail"
exit $fail
