/**
 * Serializes slide asset loading so decks hydrate one slide at a time
 * instead of thrashing the network with every slide at once.
 */
let chain = Promise.resolve()

export function enqueueSlideLoad(task) {
  const run = chain.then(() => task())
  // Keep the queue alive even if one slide fails.
  chain = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

export function resetSlideLoadQueue() {
  chain = Promise.resolve()
}
