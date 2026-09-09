#!/usr/bin/env bash
# 목데이터의 원격 이미지 URL 을 전수 검증한다.
# ⚠️ 처음 후보를 모을 때 20개 중 3개가 404 였다 — 화면에서 회색 타일로만 보여 조용히 넘어간다.
set -u
fail=0
ids=$(grep -oE "'1[0-9]{9,12}-[0-9a-f]+'" src/lib/mock-brands.ts | tr -d "'" | sort -u)
total=$(echo "$ids" | wc -l | tr -d ' ')
for id in $ids; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    "https://images.unsplash.com/photo-$id?auto=format&fit=crop&w=200&q=50")
  if [ "$code" != "200" ]; then echo "FAIL $code photo-$id"; fail=$((fail+1)); fi
done
if [ "$fail" -eq 0 ]; then echo "OK — $total unique image ids, all 200"; else
  echo "$fail/$total broken. 위 id 를 교체할 것."; exit 1; fi
