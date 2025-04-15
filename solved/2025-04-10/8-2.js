// 제공된 함수

async function fetchGroup(i) {
  // i: 0 ~ 2
  console.log(`fetching group ${i}`);
  if (Math.random() < 0.2) throw new Error("API failure");

  const samples = [
    [
      { id: 1, name: "Alice", role: "admin" },
      { id: 2, name: "Bob", role: "editor" },
    ],
    [
      { id: 2, name: "Bob", role: "editor" },
      { id: 3, name: "Charlie", role: "viewer" },
    ],
    [
      { id: 3, name: "Charlie", role: "viewer" },
      { id: 4, name: "Dave", role: "dev" },
    ],
  ];

  return new Promise((resolve) => setTimeout(() => resolve(samples[i]), 300));
}

async function fetchWithRetry(fetchIndices) {
  //index 순회하며 fetch
  const firstResult = await Promise.allSettled(
    fetchIndices.map((index) => fetchGroup(index))
  );

  let failIndex = filterSettledResultsByStatus(firstResult, "rejected").map(
    (res) => fetchIndices[res.index]
  );
  console.log(`fetch 실패 index: ${failIndex} (재시도 예정)`); //error 로그

  const retryResult = await Promise.allSettled(
    // 실패한 index만 재요청
    failIndex.map((index) => fetchGroup(index))
  );

  failIndex = filterSettledResultsByStatus(retryResult, "rejected").map(
    (res) => fetchIndices[res.index] //최종 실패 index 추출 (로그용)
  );

  console.log(
    `fetch 최종 실패 index: ${failIndex.length ? failIndex : "없음"}`
  );

  const result = filterSettledResultsByStatus([...firstResult, ...retryResult])
    .map((res) => res.value)
    .flat();
  return result;
}

function filterSettledResultsByStatus(res, status = "fulfilled") {
  return res
    .map((res, i) => ({ ...res, index: i })) // 결과 + index 배열 생성 (index활용이 필요할 수 있음)
    .filter((res) => res.status === status); // 원하는 status 값만 필터링
}

function getfailedFetchIndexBySettledResult(fetchIndices, result) {
  return result.map(({ index }) => fetchIndices[index]);
}
