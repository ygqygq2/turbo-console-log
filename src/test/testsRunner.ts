export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  mocha.timeout(10000);
  const testsRoot = path.resolve(__dirname, '..');

  return new Promise<void>((resolve, reject) => {
    glob('**/**.test.ts', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err);
      }

      // Add files to the test suite
      files.forEach((file) => {
        const testFile = path.resolve(testsRoot, file);
        mocha.addFile(testFile);
      });

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  });
}
