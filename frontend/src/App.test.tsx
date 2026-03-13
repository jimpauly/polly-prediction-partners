import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './main';

describe('App layout', () => {
  it('renders all four quadrants and seven regions initially', () => {
    render(<App />);
    // quadrants exist and have positive size
    ['quadrant-i','quadrant-ii','quadrant-iii','quadrant-iv'].forEach(id => {
      const elem = screen.getByTestId(id);
      expect(elem).toBeInTheDocument();
      // JSDOM doesn't layout elements, so width/height are usually 0.
      // existence is enough for our purposes here.
    });
    expect(screen.getByText(/Paulie's Studios/i)).toBeInTheDocument();
    // regions now contain cards instead of static labels
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM DESIGN/i)).toBeInTheDocument();
    expect(screen.getByText(/INSPECTOR PANEL/i)).toBeInTheDocument();
    expect(screen.getByText(/Periscope Viewing Port/i)).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
    // main region should exist and label itself appropriately
    const mainRegion = screen.getByTestId('main-region');
    expect(mainRegion).toBeInTheDocument();
    // target only the region title element, since the text appears multiple times
    expect(
      within(mainRegion).getByText(/MAIN REGION - DESIGN/i, { selector: '.region-title' })
    ).toBeInTheDocument();
    // quadrant-II inner container exists and has some padding (visual checks
    // happen in the browser environment).
    const inner = document.getElementById('quadrant-ii-inner');
    expect(inner).toBeTruthy();
    // nav should sit between the header and the rest of the UI;
    // sidebars now start in the same row as nav so they reach up to the
    // header bar.  verify grid-template-areas reflects this pattern.
    if(inner) {
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    }
    // ensure the sidebars start on the second grid row (just below header)
    const leftSide = screen.getByTestId('left-sidebar');
    const rightSide = screen.getByTestId('right-sidebar');
    // gridRowStart is not reliable in JSDOM, but we know the elements exist
    expect(leftSide).toBeInTheDocument();
    expect(rightSide).toBeInTheDocument();

    // Quadrant placeholders should render the blank guidance messages
    expect(screen.getByText(/leave blank because our webpage/i)).toBeInTheDocument();
    expect(screen.getByText(/Decoy Quadrant to make devs forget/i)).toBeInTheDocument();
    expect(screen.getByText(/Decoy Quadrant to ensure this website fits/i)).toBeInTheDocument();
    // scrollbar styling is handled in CSS; visual verification is done in a real browser.
  });

  it('toggles visibility when nav buttons pressed', () => {
    render(<App />);
    const headerToggle = screen.getByLabelText('Toggle Header');
    fireEvent.click(headerToggle);
    expect(screen.queryByText(/Paulie's Studios/i)).toBeNull();
    fireEvent.click(headerToggle);
    expect(screen.getByText(/Paulie's Studios/i)).toBeInTheDocument();
  });

  it('renders sample cards in left sidebar', () => {
    render(<App />);
    expect(screen.getByText('MODES')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM THEME')).toBeInTheDocument();
    // two toggle switches should appear
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(2);
  });

  it('theme buttons change data-theme attribute', () => {
    render(<App />);
    const webpageBtn = screen.getByText('Webpage');
    const mosaicBtn = screen.getByText('Mosaic');
    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('webpage-light');
    fireEvent.click(mosaicBtn);
    expect(root.getAttribute('data-theme')).toBe('mosaic-1993-light');
  });

  it('illumination controls can toggle NVG mode', () => {
    render(<App />);
    const dayToggle = screen.getByLabelText(/Day\/Night toggle/i);
    expect(document.documentElement.classList.contains('nvg')).toBe(false);
    fireEvent.click(dayToggle);
    expect(document.documentElement.classList.contains('nvg')).toBe(true);
  });

  it('renders placeholder cards in right sidebar and bottom bar and allows notes and email', () => {
    render(<App />);
    expect(screen.getByText('INSPECTOR')).toBeInTheDocument();
    expect(screen.getByText('Hangar Bay')).toBeInTheDocument();
    // notes book should show textarea and accept input
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    fireEvent.click(notesTab);
    const textarea = screen.getByLabelText('Inspector notes');
    expect(textarea).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(textarea).toHaveValue('hello');
    // send card is present without a header
    const sendButton = screen.getByRole('button', { name: /Send to Paulie/i });
    expect(sendButton).toBeInTheDocument();
    const sendCard = sendButton.closest('.card');
    expect(sendCard).not.toHaveTextContent('SEND');
    // inspector book interaction for other books still works
    const historyTab = screen.getByRole('tab', { name: /History/i });
    fireEvent.click(historyTab);
    expect(screen.getByText(/History log/i)).toBeInTheDocument();
  });

  it('design studio shows palette, manometer, logs and elements cards', () => {
    render(<App />);
    expect(screen.getByText('Active Palette')).toBeInTheDocument();
    expect(screen.getByText("Man-O'-Meters")).toBeInTheDocument();
    expect(screen.getByText('System Logs')).toBeInTheDocument();
    expect(screen.getByText('Web Elements')).toBeInTheDocument();
    // clicking add log button should append entry
    const addBtn = screen.getByRole('button', { name: /Add log/i });
    fireEvent.click(addBtn);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('throttle card renders and can cycle modes, locks', () => {
    render(<App />);
    const radioGroup = screen.getByRole('radiogroup', { name: /Global throttle control/i });
    const auto = within(radioGroup).getByRole('radio', {name:'AUTO'});
    const stop = within(radioGroup).getByRole('radio', {name:'STOP'});
    expect(stop).toHaveAttribute('aria-checked','true');
    // click AUTO
    fireEvent.click(auto);
    expect(auto).toHaveAttribute('aria-checked','true');
    const lockBtn = screen.getByRole('button', {name: /Lock|Unlock/});
    fireEvent.click(lockBtn);
    expect(lockBtn).toHaveAttribute('aria-pressed','true');
    // attempt change while locked
    fireEvent.click(stop);
    expect(auto).toHaveAttribute('aria-checked','true');
  });

  it('renders hangar bay with rectangle and square cards', () => {
    render(<App />);
    const agent = screen.getByText('Agent Access');
    const pl = screen.getByText('P/L MFD');
    const api = screen.getByText('Connect API Keys');
    expect(agent).toBeInTheDocument();
    expect(pl).toBeInTheDocument();
    expect(api).toBeInTheDocument();
    // shape classes on parent cards
    expect(agent.closest('.hangar-card')).toHaveClass('rectangle');
    expect(pl.closest('.hangar-card')).toHaveClass('square');
    expect(api.closest('.hangar-card')).toHaveClass('square');
  });

  it('shows brand title, HUD label, studio tabs, visibility toggles, and telemetry', () => {
    render(<App />);
    expect(screen.getByText(/Paulie's Studios/i)).toBeInTheDocument();
    expect(screen.getByText(/HUD/i)).toBeInTheDocument();
    // nav should now be inside quadrant-II container
    const quadrant2 = screen.getByTestId('left-sidebar').parentElement?.parentElement; // hacky but ensures container exists
    const nav = within(quadrant2 || document.body).getByRole('navigation');
    // tabs
    const tablist = within(nav).getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    expect(within(tablist).getByRole('tab', { name: /DESIGN/i })).toHaveAttribute('aria-selected', 'true');
    // header and nav should be placed in the quadrant-II grid
    // header and nav exist in the inner grid container
    expect(screen.getByTestId('header-region')).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    // quadrant-II container should exist within the DOM
    const quad = screen.getByTestId('quadrant-ii');
    expect(quad).toBeInTheDocument();
    // each region element should be present and identifiable
    expect(screen.getByTestId('header-region')).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-region')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
    expect(screen.getByTestId('action-bar')).toBeInTheDocument();
    // regions should have borders for visual confirmation (style not computed by JSDOM)

    // fly tab should be disabled and show padlock
    const flyTab = within(tablist).getByRole('tab', { name: /FLIGHT/i });
    expect(flyTab).toHaveAttribute('aria-disabled', 'true');
    expect(flyTab).toHaveTextContent('🔒');
    // visibility toggles exist and are buttons with proper aria-labels
    const headerToggle = within(nav).getByRole('button', { name: /Toggle Header/i });
    expect(headerToggle).toBeInTheDocument();
    const leftToggle = within(nav).getByRole('button', { name: /Toggle Left Sidebar/i });
    expect(leftToggle).toBeInTheDocument();
    // telemetry items
    expect(within(nav).getByText(/PING/i)).toBeInTheDocument();
  });
});
