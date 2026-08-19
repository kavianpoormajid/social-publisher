import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Page from "../app/page";
import { beforeEach, afterEach } from "vitest";
import {
  mockBulkUpdatePosts,
  mockPathUpdatePosts,
  mockUsePosts,
} from "./mock-posts";
import PostResponses from "./post.responses";
import { POSTS_VIEW_ENUM } from "@/types/global";
import { userEvent } from "@testing-library/user-event";
import { formatJalaliDateTime } from "@/utils/date";
const mockNavigation = {
  pathname: "/",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn((url: string) => {
      const [pathname, search] = url.split("?");

      mockNavigation.pathname = pathname;
      mockNavigation.searchParams = new URLSearchParams(search ?? "");
    }),

    replace: vi.fn((url: string) => {
      const [pathname, search] = url.split("?");

      mockNavigation.pathname = pathname;
      mockNavigation.searchParams = new URLSearchParams(search ?? "");
    }),

    back: vi.fn(),
  }),

  usePathname: () => mockNavigation.pathname,

  useSearchParams: () => mockNavigation.searchParams,
}));
vi.mock("@/app/fonts/vazirFont", () => ({}));
vi.mock("next/font/local", () => ({}));

vi.mock("@dnd-kit/react", async () => {
  const MockDragDropProvider = React.forwardRef<
    HTMLDivElement,
    {
      children: React.ReactNode;
      onDragEnd?: (event: unknown) => void;
    }
  >(({ children }, ref) => {
    return <div ref={ref}>{children}</div>;
  });
  MockDragDropProvider.displayName = "MockDragDropProvider";
  return {
    DragDropProvider: MockDragDropProvider,
    useDroppable: () => ({ ref: React.createRef(), id: Math.random() }),
    useDraggable: () => ({
      ref: React.createRef(),
      handleRef: React.createRef(),
      isDragging: false,
    }),
  };
});

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});
beforeEach(() => {
  mockNavigation.pathname = "/";
  mockNavigation.searchParams = new URLSearchParams();
});
describe("Home page", () => {
  test("renders posts returned from API", async () => {
    mockUsePosts(PostResponses.CurrentWeekPosts);
    renderHome();
    const publishedPosts = await screen.findAllByText("published");
    expect(publishedPosts.length).toBeGreaterThan(0);
  });
  test("changes URL when clicking next week as filter", async () => {
    mockUsePosts(PostResponses.CurrentWeekPosts);
    renderHome();
    const nextWeekButton = screen.getByTestId("next-week-button");
    const oldFromFilter = mockNavigation.searchParams.get("from");

    fireEvent.click(nextWeekButton);
    const newFromFilter = mockNavigation.searchParams.get("from");
    await waitFor(() => {
      expect(oldFromFilter).not.equal(newFromFilter);
    });
  });
  test("switch to table view", async () => {
    mockUsePosts(PostResponses.CurrentWeekPosts);
    renderHome();
    const tabelViewButton = screen.getByTestId("table-view-button");
    fireEvent.click(tabelViewButton);

    const publishedPosts = await screen.findAllByText("published");
    expect(publishedPosts.length).toBeGreaterThan(0);
    expect(mockNavigation.searchParams.get("view")).toEqual(
      POSTS_VIEW_ENUM.TABLE,
    );
  });
  test("bulk edit flow with 1 fail and 1 successfuly patch and role back", async () => {
    mockUsePosts(PostResponses.CurrentWeekPosts);
    renderHome();
    const tabelViewButton = screen.getByTestId("table-view-button");
    fireEvent.click(tabelViewButton);

    const publishedPosts = await screen.findAllByText("published");
    expect(publishedPosts.length).toBeGreaterThan(0);
    expect(mockNavigation.searchParams.get("view")).toEqual(
      POSTS_VIEW_ENUM.TABLE,
    );

    // get and checked post checkboxs
    const postId1 = PostResponses.CurrentWeekPosts.items[0].id;
    const postId2 = PostResponses.CurrentWeekPosts.items[1].id;
    // const rowContainer =await screen.findByTestId(`post-item-row-${postId2}`)
    const postCheckBoxId1 = `post-item-select-checkbox-input-${postId1}`;
    const postCheckBoxId2 = `post-item-select-checkbox-input-${postId2}`;
    expect(await screen.findByTestId(postCheckBoxId2)).toBeInTheDocument();
    const postCheckBox1 = screen.getByTestId(postCheckBoxId1);
    const postCheckBox2 = screen.getByTestId(postCheckBoxId2);

    fireEvent.click(postCheckBox1);
    await waitFor(() => {
      expect(postCheckBox1).toBeChecked();
    });
    fireEvent.click(postCheckBox2);
    await waitFor(() => {
      expect(postCheckBox2).toBeChecked();
    });
    // open and check modal
    const BulkEditModalButton = screen.getByTestId("bulk-edit-modal-button");
    fireEvent.click(BulkEditModalButton);
    expect(
      await screen.findByTestId("bulk-edit-scheduled-checkbox-input"),
    ).toBeInTheDocument();

    // active scheduled value
    const BulkEditScheduledCheckbox = screen.getByTestId(
      "bulk-edit-scheduled-checkbox-input",
    );
    fireEvent.click(BulkEditScheduledCheckbox);
    expect(BulkEditScheduledCheckbox).toBeChecked();

    // set value of scheduledAt input
    expect(
      await screen.findByTestId("bulk-edit-scheduled-value-input"),
    ).toBeInTheDocument();

    const BulkEditScheduledInput = screen.getByTestId(
      "bulk-edit-scheduled-value-input",
    );
    const newDate = "2026-08-20T14:30";
    fireEvent.change(BulkEditScheduledInput, {
      target: {
        value: newDate,
      },
    });
    expect(BulkEditScheduledInput).toHaveValue(newDate);

    // submit
    mockBulkUpdatePosts({
      failed: [
        {
          id: postId1,
          reason: "DAILY_LIMIT_EXCEEDED",
        },
      ],
      succeeded: [postId2],
    });
    const BulkEditSubmitButton = screen.getByTestId("bulk-edit-submit");
    fireEvent.click(BulkEditSubmitButton);
    // mock bulk update response

    // open report modal and check result
    expect(await screen.findByTestId(`post-item-row-${postId2}`)).toHaveClass(
      "bg-green-200",
    );
    expect(await screen.findByTestId(`post-item-row-${postId1}`)).toHaveClass(
      "bg-red-200",
    );
    expect(await screen.findByTestId("bulk-report-modal")).toBeInTheDocument();
    expect(
      await screen.findByTestId("bulk-report-success-count"),
    ).toHaveTextContent("1");
    expect(
      await screen.findByTestId("bulk-report-failure-count"),
    ).toHaveTextContent("1");
  });
  test("bulk edit flow with 2 successfuly patch and [undo]", async () => {
    mockUsePosts(PostResponses.CurrentWeekPosts);
    renderHome();
    const tabelViewButton = screen.getByTestId("table-view-button");
    fireEvent.click(tabelViewButton);

    const publishedPosts = await screen.findAllByText("published");
    expect(publishedPosts.length).toBeGreaterThan(0);
    expect(mockNavigation.searchParams.get("view")).toEqual(
      POSTS_VIEW_ENUM.TABLE,
    );

    // get and checked post checkboxs
    const postId1 = PostResponses.CurrentWeekPosts.items[0].id;
    const postId2 = PostResponses.CurrentWeekPosts.items[1].id;
    // const rowContainer =await screen.findByTestId(`post-item-row-${postId2}`)
    const postCheckBoxId1 = `post-item-select-checkbox-input-${postId1}`;
    const postCheckBoxId2 = `post-item-select-checkbox-input-${postId2}`;
    expect(await screen.findByTestId(postCheckBoxId2)).toBeInTheDocument();
    const postCheckBox1 = screen.getByTestId(postCheckBoxId1);
    const postCheckBox2 = screen.getByTestId(postCheckBoxId2);

    fireEvent.click(postCheckBox1);
    await waitFor(() => {
      expect(postCheckBox1).toBeChecked();
    });
    fireEvent.click(postCheckBox2);
    await waitFor(() => {
      expect(postCheckBox2).toBeChecked();
    });
    // open and check modal
    const BulkEditModalButton = screen.getByTestId("bulk-edit-modal-button");
    fireEvent.click(BulkEditModalButton);
    expect(
      await screen.findByTestId("bulk-edit-scheduled-checkbox-input"),
    ).toBeInTheDocument();

    // active scheduled value
    const BulkEditScheduledCheckbox = screen.getByTestId(
      "bulk-edit-scheduled-checkbox-input",
    );
    fireEvent.click(BulkEditScheduledCheckbox);
    expect(BulkEditScheduledCheckbox).toBeChecked();

    // set value of scheduledAt input
    expect(
      await screen.findByTestId("bulk-edit-scheduled-value-input"),
    ).toBeInTheDocument();

    const BulkEditScheduledInput = screen.getByTestId(
      "bulk-edit-scheduled-value-input",
    );
    const newDate = "2026-08-20T14:30";
    fireEvent.change(BulkEditScheduledInput, {
      target: {
        value: newDate,
      },
    });
    expect(BulkEditScheduledInput).toHaveValue(newDate);

    // submit
    const BulkEditSubmitButton = screen.getByTestId("bulk-edit-submit");
    fireEvent.click(BulkEditSubmitButton);
    // mock bulk update response
    mockBulkUpdatePosts({
      failed: [],
      succeeded: [postId2, postId1],
    });

    // open report modal and check result
    expect(await screen.findByTestId(`post-item-row-${postId1}`)).toHaveClass(
      "bg-green-200",
    );
    expect(await screen.findByTestId(`post-item-row-${postId2}`)).toHaveClass(
      "bg-green-200",
    );
    expect(await screen.findByTestId("bulk-report-modal")).toBeInTheDocument();
    expect(
      await screen.findByTestId("bulk-report-success-count"),
    ).toHaveTextContent("2");

    // close report modal
    expect(
      await screen.findByTestId("bulk-report-modal-close-button"),
    ).toBeInTheDocument();
    const BulkReportModalCloseButton = screen.getByTestId(
      "bulk-report-modal-close-button",
    );
    fireEvent.click(BulkReportModalCloseButton);
    expect(
      screen.queryAllByTestId("bulk-report-modal-close-button").length,
    ).toEqual(0);
    mockPathUpdatePosts(postId1, PostResponses.CurrentWeekPosts.items[0]);
    mockPathUpdatePosts(postId2, PostResponses.CurrentWeekPosts.items[0]);
    // // press ctrl+z
    const user = userEvent.setup();
    await user.keyboard("{Control>}z{/Control}");

    expect(
      await screen.findByTestId(`post-item-scheduledat-${postId1}`),
    ).toHaveTextContent(
      formatJalaliDateTime(PostResponses.CurrentWeekPosts.items[0].scheduledAt),
    );

    expect(
      await screen.findByTestId(`post-item-scheduledat-${postId2}`),
    ).toHaveTextContent(
      formatJalaliDateTime(PostResponses.CurrentWeekPosts.items[1].scheduledAt),
    );
  });
});
