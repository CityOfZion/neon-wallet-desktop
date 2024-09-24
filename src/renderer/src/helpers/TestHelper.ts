const TEST_ID_PROPERTY = 'data-test-id'

export class TestHelper {
  static buildTestObject(testId?: string, suffix?: string) {
    if (testId && suffix) testId = `${testId}-${suffix}`

    return testId ? { [TEST_ID_PROPERTY]: testId } : {}
  }
}
