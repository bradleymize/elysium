import { ElysiumPage } from './app.po';

describe('elysium App', () => {
  let page: ElysiumPage;

  beforeEach(() => {
    page = new ElysiumPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
